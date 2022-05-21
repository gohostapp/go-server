let express = require('express');
const router = express.Router();
const util = require('../lib/utils');
const consts = require('../constants/consts');



/**
* @api {get} /user/me User Profile
* @apiDescription Return User attributes and validate session
* @apiName User Profile
* @apiGroup User
* @apiVersion 1.0.0

* @apiSuccess {Object} data                 Response object with following two keys.
* @apiSuccess {String} data.email           As received from google
* @apiSuccess {String} data.name            As received from google
* @apiSuccess {String} data.picture         As received from google
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
 *               "email": "email@id",
 *               "name": "Tarun Mittal",
 *               "picture": "profile image url",
 *           }
 * 
 *     }
* @apiUse Error
* @apiUse Forbidden
* @apiSampleRequest off
*/
router.get('/me', [], function (req, res) {
    let result = util.getResponseObject(consts.RESPONSE_SUCCESS);
    result.data = {
        email : req?.user?.identifier,
        picture : req.user?.google?.picture,
        name : req.user?.google?.name,
    }
    util.sendResponse(result, req, res);
});

module.exports = router;
