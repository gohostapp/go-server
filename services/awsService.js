const AWS = require('aws-sdk');
const req = require('express/lib/request');
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
let consts = require("../constants/consts")
const hostDao = require("../dao/host")

let createInstance = (req, res) => {
    let data = req.body;
    let keyPairName = "csgo_server_key_"+new Date().getTime();
    let commands = [
        '#!/usr/bin/env bash',
        `/home/ubuntu/updateAutoExec "${data.hostname || "GoHost Private Server"}" "${data.rcon_password || "password"}" "${data.sv_password || ""}"`,
        `/home/ubuntu/update-server`,
        `/home/ubuntu/launch-server ${data.steam_server_token} ${data.tickrate}`,
    ];
    let  instanceParams = {
        ImageId: process.env.CSGO_AMI_ID, 
        InstanceType: 't2.micro',
        KeyName: keyPairName,
        UserData: Buffer.from(commands.join("\n")).toString('base64'),
        MinCount: 1,
        MaxCount: 1
    };
    return createSecurityGroup().
    then(securityGroupId => {
        return createKeyPair(keyPairName)
        .then((keyData) => {
            instanceParams["SecurityGroupIds"] = [securityGroupId]
            return ec2.runInstances(instanceParams).promise()
            .then((instanceData) => {
                return hostDao.createServer({
                    user : req.user._id,
                    instance_id : instanceData["Instances"][0].InstanceId,
                    private_key : keyData.KeyMaterial,
                    is_active : true,
                    launch_params : data,
                }).then( host => {
                    return {instance_id : instanceData["Instances"][0].InstanceId, message : consts.CREATE_SERVER_MESSAGE};
                })
            })
        })
    })
    .catch((err) => {
        console.error(err);
        return Promise.reject(err);
    });
}

//creates a new key pair for each server
let createKeyPair = (keyPairName) => {
    return ec2.createKeyPair({KeyName: keyPairName}).promise();
}

//find security group created with given name
let findSecurityGroups = () => {
    let params = {
        GroupNames : [consts.SECURITY_GROUP_NAME]
    };
    return ec2.describeSecurityGroups(params).promise()
    .then((data) => {
        return data;
    })
    .catch((err) => {
        //if group not found, return null, and handle subsequently
        return null;
    });
}


//finds existing security group with given name, other wise creates one.
let createSecurityGroup = () => {
    return findSecurityGroups()
    .then((securityGroup)=>{
       if(securityGroup && securityGroup.SecurityGroups[0].GroupId){
           return securityGroup.SecurityGroups[0].GroupId;
       }else{
            return ec2.describeVpcs().promise()
            .then((data) => {
                let vpc = data.Vpcs[0].VpcId;
                let paramsSecurityGroup = {
                    Description: 'Security group created while launching On Demand CsGo Server',
                    GroupName: consts.SECURITY_GROUP_NAME,
                    VpcId: vpc
                };
                return ec2.createSecurityGroup(paramsSecurityGroup).promise()
                .then((data) => {
                    let securityGroupId = data.GroupId;
                    let paramsIngress = {
                        GroupId: securityGroupId,
                        IpPermissions: consts.CSGO_SECURITY_GROUP_IP_PERMISSIONS
                    };
                    return ec2.authorizeSecurityGroupIngress(paramsIngress).promise()
                    .then(()=>{
                        return securityGroupId
                    })
                })
            }) 
       }
    })
    .catch((err) => {
        console.log("Error creating Security Group");
        console.error(err);
        return Promise.reject(err);
    });
}

let listCsGoServers = (req) => {
    return hostDao.fetchUserServers(req.user._id)
    .then((hosts) => {
        console.log("FOUND HOSTS ", hosts.length)
        if(!hosts || hosts.length == 0)
            return [];
        else{
            let instanceIds = hosts.map(host => host.instance_id);
            let params = {
                InstanceIds: instanceIds,
                Filters: [{
                    "Name" : "instance-state-name",
                     "Values" : ["pending", "running"]
                }]
            };
            //add filters to params to fetch running instances only 
            return ec2.describeInstances(params).promise()
            .then((data) => {
                let resultServers = [];
                let updatePromises = [];
                for(var j=0;j<hosts.length;j++){
                    let host = hosts[j].sanitized();
                    for(var i=0;i<data.Reservations.length;i++){
                        if(data.Reservations[i].Instances && data.Reservations[i].Instances.length > 0){
                            for(var k=0;k<data.Reservations[i].Instances.length;k++){
                                let instance = data.Reservations[i].Instances[k];
                                if(instance.InstanceId  == host.instance_id){
                                    if(!host.public_ip && instance.PublicIpAddress){
                                        host.public_ip = instance.PublicIpAddress;
                                        updatePromises.push(hostDao.updateServerIp(host._id, instance.PublicIpAddress));
                                    }
                                    resultServers.push(host);
                                }
                            }
                        }
                    }
                }
                return resultServers;
            })
            .catch((err) => {
                //if group not found, return null, and handle subsequently
                console.log("GOT ERROR ", err)
                return Promise.reject(new HttpError(consts.BAD_REQUEST, err), null)
            });
        }
    })
   
}

module.exports.createInstance = createInstance;
module.exports.listCsGoServers = listCsGoServers;

