let userDao = require("../dao/user");

let authUser = (steamData) => {
    return userDao.getUserBySteam(steamData)
    .then((user) => {
        console.log("FETCHING FROM DB ", user);
        if(!user){
            console.log("CREATING ON")
            return userDao.createUser(steamData);
        }else
            return user;
    })
    .catch((err) => {
        return Promise.reject(err);
    });
}

module.exports.authUser = authUser;