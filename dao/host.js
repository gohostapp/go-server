var mongo = require('../models/mongo');
var consts = require('../constants/consts')

module.exports.createServer = function(data){
    var newHost = new mongo.Host(data);
    return newHost.save();
}

module.exports.fetchUserServers = function(user_id){
    return mongo.Host.find({user : user_id});
}

module.exports.updateServerIp = (id, publicIp) => {
    return mongo.Host.findByIdAndUpdate(id, {$set : {public_ip : publicIp}});
}

module.exports.findServerById = (id) => {
    return mongo.Host.findById(id);
}

module.exports.stopServer = (id) => {
    return mongo.Host.findByIdAndUpdate(id, {$set : {is_active : false}});
}