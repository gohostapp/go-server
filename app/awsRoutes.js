let express = require('express');
const router = express.Router();
const awsService = require('../services/awsService');
const util = require('../lib/utils');
const consts = require('../constants/consts');
let bodyParserValidator = require('express-body-parser-validator').hasReqParam


/**
* @api {get} /server/start Start Server
* @apiDescription Start a CsGo server on AWS, create a key pair to access it, and attach a valid security group to it.
* @apiName Start Server
* @apiGroup Servers
* @apiVersion 1.0.0
*
* @apiParam {String} hostname                            Your server name
* @apiParam {String} rcon_password                       You will use this password in CsGo console to log on as server admin
* @apiParam {String} sv_password                         Server password.
* @apiParam {String} aws_region                          Pass the region code, where you want to start your server (closest to you will give you best ping.) List of regions here `https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions`
* @apiParamExample {json} Request-Example:
*     {
*           "hostname" : "deadfox server",
*           "rcon_password": "rcon_pass_1",
*           "sv_password" : "sv_pass_1",
*           "aws_region" : "ap-south-1"
*      }
* 
* @apiSuccess {Object} data                 Response object with following two keys.
* @apiSuccess {String} data.instance_id     AWS instance ID of server you just started. Better if you note it down. Can be see in AWS console as well, navigate here after you login to AWS `https://ap-south-1.console.aws.amazon.com/ec2/v2/home#Instances:instanceState=running;sort=instanceId`. Select the correct region from top right, if you don't see a running server.
* @apiSuccess {String} status  success.
* @apiSuccess {Number} response_code 200.
* @apiSuccess {String} response_message Empty or error message.

* @apiUse SuccessResponse
* @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status": "success",
 *          "response_code": 200,
 *          "response_message": "",
 *          "data": {
 *              "instance_id": "i-xxxxxxxxxxxxxxxxx",
 *           }
 * 
 *     }
* @apiUse Error
* @apiUse MissingReqParam
* @apiUse Forbidden
* @apiSampleRequest off
*/
router.post('/start', [express.json(), bodyParserValidator(["hostname", "rcon_password", "sv_password", "tickrate"])], function (req, res) {
    awsService.createInstance(req, res).then((data) => {
        let result = util.getResponseObject(consts.RESPONSE_SUCCESS);
        result.data = data;
        util.sendResponse(result, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});



/**
* @api {get} /server/list List Servers
* @apiDescription List User's CSGO Servers
* @apiName List Servers
* @apiGroup Servers
* @apiVersion 1.0.0
*
* @apiSuccess {Object[]} data                     Response object with following two keys.
* @apiSuccess {String} data._id                 Internal Server Id. To be used with delete server request
* @apiSuccess {String} data.is_active           Weather server is currently active.
* @apiSuccess {String} data.public_ip           Server's Public IP V4 address
* @apiSuccess {Object} data.launch_params       
* @apiSuccess {String} data.launch_params.hostname          Server's Hostname
* @apiSuccess {String} data.launch_params.rcon_password     Server's RCON
* @apiSuccess {String} data.launch_params.sv_password       Server's Login Password
* @apiSuccess {String} data.launch_params.tickrate          Server's tickrate
* @apiSuccess {String} status  success.
* @apiSuccess {Number} response_code 200.
* @apiSuccess {String} response_message Empty or error message.

* @apiUse SuccessResponse
* @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status": "success",
 *          "response_code": 200,
 *          "response_message": "",
 *          "data": {
 *              "instance_id": "i-xxxxxxxxxxxxxxxxx",
 *           }
 * 
 *     }
 * 
* @apiUse Error
* @apiUse EntityNotFound
* @apiUse Forbidden
* @apiSampleRequest off
*/
router.get('/list', [express.json()], function (req, res) {
    awsService.listCsGoServers(req).then((data) => {
        let result = util.getResponseObject(consts.RESPONSE_SUCCESS);
        result.data = data;
        util.sendResponse(result, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});




/**
* @api {DELETE} /server/stop Delete Server
* @apiDescription Delete User's CSGO Server
* @apiName Delete Server
* @apiGroup Servers
* @apiVersion 1.0.0
* @apiParam    {String} server_id                          _id received in list Server response.
* @apiSuccess {String} status  success.
* @apiSuccess {Number} response_code 200.
* @apiSuccess {String} response_message Empty or error message.

* @apiUse SuccessResponse
* @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "status": "success",
 *          "response_code": 200,
 *          "response_message": "",
 *          "data": {
 *              "server_id": "xxxxxxxxxxxxxxxxx",
 *           }
 * 
 *     }
 * 
* @apiUse Error
* @apiUse MissingReqParam
* @apiUse Forbidden
* @apiSampleRequest off
*/
router.delete('/stop', [express.json(), bodyParserValidator(["server_id"])], function (req, res) {
    awsService.stopServer(req).then((data) => {
        let result = util.getResponseObject(consts.RESPONSE_SUCCESS);
        util.sendResponse(result, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


module.exports = router;
