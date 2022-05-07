var mongo = require('../models/mongo');
var consts = require('../constants/consts')

module.exports.createServer = function(data){
    var newHost = new mongo.Host(data);
    return newHost.save();
}
