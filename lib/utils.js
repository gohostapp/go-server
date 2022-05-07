let consts = require('../constants/consts.js');
let httpError = require('../errors/httpError');
let httpStatusCodes = require('../constants/httpStatusCodes');
let responseConsts = require('../constants/responseConst');
const { utils } = require('cluster');


let getResponseObject = (status, message, success = true) => {
    if (status.text == 'error') {
        //logger.log(message);
    }
    return {
        'status': status.text,
        'response_code': status.code,
        'response_message': status.text === 'success' ? "" : message,
        'success': status.success
    }
};

let sendResponse = (data, req, res) => {
    res.status(200).json(data);
};


let sendError = (err, req, res) => {
    console.log('Error is ', err);
    if (err instanceof httpError) {
        let { response: err_string } = err.response;
        if (err_string == '') {
            err_string = 'Some unknown error occured';
        }
        res.status(200).json(getResponseObject({ text: 'error', code: err.httpCode, success: false }, err_string) || {});
        //res.status(err.httpCode).json(err.response || {});
        return;
    }
   
    let err_string = 'Some unknown error occured, please try again';
    //Log it somewhere
    res.status(200).json(getResponseObject({ text: 'error', code: 403, success: false }, err_string) || {});
    //Dont throw it for now
    //throw err;
};


let ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()){ 
        next(); 
    }else{
        sendError(new httpError(httpStatusCodes.FORBIDDEN, { response: "Unauthorized Request" }), req, res);
    }
   
}
module.exports.sendResponse = sendResponse;
module.exports.sendError = sendError;
module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.getResponseObject = getResponseObject;