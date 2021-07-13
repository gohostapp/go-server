let statusCodes = {};

statusCodes[exports.BAD_REQUEST = 400] = "Bad Request";
statusCodes[exports.NOT_FOUND = 404] = "Not Found";
statusCodes[exports.OK = 200] = "OK";
statusCodes[exports.FORBIDDEN = 403] = "Forbidden";



statusCodes[exports.ACCEPTED = 202] = "Accepted";
statusCodes[exports.BAD_GATEWAY = 502] = "Bad Gateway";

statusCodes[exports.HTTP_VERSION_NOT_SUPPORTED = 505] = "HTTP Version Not Supported";
statusCodes[exports.IM_A_TEAPOT = 418] = "I'm a teapot";
statusCodes[exports.INSUFFICIENT_SPACE_ON_RESOURCE = 419] = "Insufficient Space on Resource";
statusCodes[exports.INTERNAL_SERVER_ERROR = 500] = "Server Error";


exports.getStatusText = function (statusCode) {
    if (statusCodes.hasOwnProperty(statusCode)) {
        return statusCodes[statusCode];
    } else {
        throw new Error("Status code does not exist: " + statusCode);
    }
};