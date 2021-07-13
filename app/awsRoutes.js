let express = require('express');
const router = express.Router();
const awsService = require('../services/awsService');
const util = require('../lib/Utils');
const consts = require('../constants/consts');
let bodyParserValidator = require('express-body-parser-validator').hasReqParam


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
