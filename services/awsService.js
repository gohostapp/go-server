const AWS = require('aws-sdk');
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
let consts = require("../constants/consts")

let createInstance = (data) => {
    let keyPairName = "csgo_server_key_"+new Date().getTime();
    let commands = [
        '#!/usr/bin/env bash',
        `/home/ubuntu/updateAutoExec "${data.hostname}" "${data.rcon_password}" "${data.sv_password}"`,
        `/home/ubuntu/launch-server ${data.steam_server_token}`,
    ];
    let  instanceParams = {
        ImageId: consts.CSGO_AMI_ID, 
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
                return {instance_id : instanceData["Instances"][0].InstanceId, private_key : keyData.KeyMaterial, message : consts.CREATE_SERVER_MESSAGE};
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

module.exports.createInstance = createInstance;

