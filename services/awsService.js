const AWS = require('aws-sdk');
const req = require('express/lib/request');
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
let consts = require("../constants/consts")
const hostDao = require("../dao/host")
let HttpError = require("../errors/httpError");
let httpStatusCodes = require("../constants/httpStatusCodes")

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
                    return {instance_id : instanceData["Instances"][0].InstanceId};
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
        if(!hosts || hosts.length == 0)
            throw new HttpError(httpStatusCodes.NOT_FOUND, { response: 'No Active server foundD' });
        else{
            return hosts;
        }
    })
    .then((hosts)=>{
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
                    let host = hosts[j]
                    for(var i=0;i<data.Reservations.length;i++){
                        if(data.Reservations[i].Instances && data.Reservations[i].Instances.length > 0){
                            for(var k=0;k<data.Reservations[i].Instances.length;k++){
                                let instance = data.Reservations[i].Instances[k];
                                if(instance.InstanceId  == host.instance_id){
                                    if(!host.public_ip && instance.PublicIpAddress){
                                        host.public_ip = instance.PublicIpAddress;
                                        updatePromises.push(hostDao.updateServerIp(host._id, instance.PublicIpAddress));
                                    }
                                    resultServers.push(host.sanitized());
                                }
                            }
                        }
                    }
                }
                return resultServers;
            })
    })
    .catch((err) => {
        //if group not found, return null, and handle subsequently
        return Promise.reject(err, null)
    });
}

let stopServer = (req) => {
    let hostId = req.body.server_id;
    return hostDao.findServerById(hostId)
    .then((host) => {
        if(host && host.user == req.user._id && host.is_active){
            return host;            
        }else{
            throw new HttpError(consts.BAD_REQUEST, { response: 'No Active server found. Invalid ID' });
        }
    })
    .then((host) =>{
        let  params = {InstanceIds: [host.instance_id]}
        return ec2.terminateInstances(params).promise()
    })
    .then(() => {
        return hostDao.stopServer(hostId);
    })
    .catch((err) => {
        //if group not found, return null, and handle subsequently
        return Promise.reject(new HttpError(consts.BAD_REQUEST, err), null)
    });
}

module.exports.createInstance = createInstance;
module.exports.listCsGoServers = listCsGoServers;
module.exports.stopServer = stopServer;

