var mongo = require('../models/mongo');
var consts = require('../constants/consts')

module.exports.createUser = function(data, vendor){
    let user = {identifier : vendor == "google" ? data.email : data.steamid}
    user[vendor] = data;
    var newUser = new mongo.User(user);
    return newUser.save();
}


module.exports.findAndUpdateUser = (user_id, updateParams) => {
    return mongo.User.findByIdAndUpdate(user_id, { $set : updateParams });
}

module.exports.findUserById = (user_id) => {
    return mongo.User.findOne({"_id" : user_id});
}

module.exports.getUserByIdentifier = (identifier)=>{
    let cond = {identifier : identifier};
    return mongo.User.findOne(cond);
}