var mongo = require('../models/mongo');
var consts = require('../constants/consts')

module.exports.createUser = function(steamData){
    let user = {steam : steamData}
    var newUser = new mongo.User(user);
    return newUser.save();
}


module.exports.findAndUpdateUser = (user_id, updateParams) => {
    return mongo.User.findByIdAndUpdate(user_id, { $set : updateParams });
}

module.exports.findUserById = (user_id) => {
    return mongo.User.findOne({"_id" : user_id});
}

module.exports.getUserBySteam = (steamData) => {
    var cond = {
        "steam.steamid": steamData.steamid
    };
    return mongo.User.findOne(cond);
}
