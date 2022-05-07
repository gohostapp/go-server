let userDao = require("../dao/user");

let authUser = (data, vendor, done) => {
    let identifier = vendor == "google" ? data.email : data.steamid; 
    return userDao.getUserByIdentifier(identifier).then((user) => {
        if(!user){
            return userDao.createUser(data, vendor);
        }else
            return user;
    })
    .catch((err) => {
        return Promise.reject(err);
    });
}

module.exports.authUser = authUser;