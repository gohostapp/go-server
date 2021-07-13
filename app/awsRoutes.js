let express = require('express');
const router = express.Router();
const awsService = require('../services/awsService');
const util = require('../lib/Utils');
const consts = require('../constants/consts');
let bodyParserValidator = require('express-body-parser-validator').hasReqParam


/**
* @api {get} /aws/start-server Start Server
* @apiDescription Start a CsGo server on AWS, create a key pair to access it, and attach a valid security group to it.
* @apiName Start Server
* @apiGroup Server Management
* @apiVersion 1.0.0
*
* @apiParam {String} steam_server_token                  This needs to be generated for your steam account. Navigate to `https://steamcommunity.com/dev/managegameservers`
* @apiParam {String} hostname                            Your server name
* @apiParam {String} rcon_password                       You will use this password in CsGo console to log on as server admin
* @apiParam {String} sv_password                         Server password.
* @apiParam {String} aws_region                          Pass the region code, where you want to start your server (closest to you will give you best ping.) List of regions here `https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions`
* @apiParamExample {json} Request-Example:
*     {
*          "steam_server_token" : "725FDDC220F092DF860826BBD2D71D43",
*           "hostname" : "deadfox server",
*           "rcon_password": "rcon_pass_1",
*           "sv_password" : "sv_pass_1",
*           "aws_region" : "ap-south-1"
*      }
* 
* @apiSuccess {Object} data                 Response object with following two keys.
* @apiSuccess {String} data.instance_id     AWS instance ID of server you just started. Better if you note it down. Can be see in AWS console as well, navigate here after you login to AWS `https://ap-south-1.console.aws.amazon.com/ec2/v2/home#Instances:instanceState=running;sort=instanceId`. Select the correct region from top right, if you don't see a running server.
* @apiSuccess {String} data.private_key     This private key is used to access your server via ssh. This should be noted down.
* @apiSuccess {String} status  success.
* @apiSuccess {Number} response_code 200.
* @apiSuccess {String} response_message Empty or error message.

* @apiUse SuccessResponse
* @apiUse Error
* @apiUse MissingReqParam
*
* @apiSampleRequest off
*/
router.post('/start-server', [express.json(), bodyParserValidator(["steam_server_token", "hostname", "rcon_password", "sv_password"])], function (req, res) {
    awsService.createInstance(req.body).then((data) => {
        let result = util.getResponseObject(consts.RESPONSE_SUCCESS);
        result.data = data;
        util.sendResponse(result, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


module.exports = router;
