exports.CSGO_AMI_ID = "ami-0f0579361559c5377";

exports.RESPONSE_SUCCESS = { text: "success", code: 200 };

exports.CSGO_SECURITY_GROUP_IP_PERMISSIONS = [
    {
       IpProtocol: "tcp",
       FromPort: 27010,
       ToPort: 27020,
       IpRanges: [{"CidrIp":"0.0.0.0/0"}]
   },
   {
       IpProtocol: "udp",
       FromPort: 27010,
       ToPort: 27020,
       IpRanges: [{"CidrIp":"0.0.0.0/0"}]
   },
   {
        IpProtocol: "tcp",
        FromPort: 22,
        ToPort: 22,
        IpRanges: [{"CidrIp":"0.0.0.0/0"}]
    }
];

exports.SECURITY_GROUP_NAME = "CsGoDedicatedServer";

exports.CREATE_SERVER_MESSAGE = "Please note down the instance id and private key for future references. You can ssh into the instance using this private key. THIS WILL NOT BE AVAILABLE IN THE FUTURE. Please Note it now. To know how to connect to instance, follow this guide: https://docs.aws.amazon.com/quickstarts/latest/vmlaunch/step-2-connect-to-instance.html"