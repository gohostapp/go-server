
/**
 * @apiDefine SuccessResponse
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status": "success"
 *          "response_code": 200
 *          "response_message": ""
 *     }
 *
 */

/**
 * @apiDefine EntityNotFound
 *
 * @apiErrorExample Not Found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "no_result_found"
 *       "response_code": 404
 *       "response_message": "No result obtained from DB for given entity, based on provided filters."
 *     }
 */

/**
 * @apiDefine MissingReqParam
 *
 * @apiErrorExample Bad Request:
 *     HTTP/1.1 400 Missing Param
 *     {
 *       "response_code": 400
 *       "response_message": [
 *                  "One or more request parameters missing"
 *          ]
 *     }
 */


/**
 * @apiDefine Error
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 500 Error
 *     {
 *       "status": "error"
 *       "response_code": 500
 *       "response_message": "Internal Server Error"
 *     }
 */

/**
 * @apiDefine Forbidden
 *
 * @apiErrorExample Forbidden:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "status": "error"
 *       "response_code": 403
 *       "response_message": "Unauthorized Request"
 *     }
 */


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

//exports.CREATE_SERVER_MESSAGE = "Please note down the instance id and private key for future references. You can ssh into the instance using this private key. THIS WILL NOT BE AVAILABLE IN THE FUTURE. Please Note it now. To know how to connect to instance, follow this guide: https://docs.aws.amazon.com/quickstarts/latest/vmlaunch/step-2-connect-to-instance.html"


exports.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS.split(",")