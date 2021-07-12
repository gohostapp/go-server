var express = require('express');
const router = express.Router();
const awsService = require('../services/awsService');
const util = require('../lib/Utils');
const consts = require('../lib/consts');
var bodyParserValidator = require('express-body-parser-validator').hasReqParam


router.post('/start-server', [express.json(), bodyParserValidator(["steam_server_token"])], function (req, res) {
    awsService.createInstance().then((app) => {
        var result = util.getResponseObject(consts.RESPONSE_SUCCESS);
        util.sendResponse(result, req, res);
    }, (err) => {
        util.sendError(err, req, res);
    });
});


module.exports = router;
