var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// models

exports.User = require("./User.js").User;
exports.Host = require("./Host.js").Host;
exports.Token = require("./Token.js").Token;

let mongoOptions = {
    autoIndex: true,
    useNewUrlParser: true
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions, function(err) {
    if (err) {
        console.error(err);
        console.error("Database connection error. Exiting process...");
        process.exit(1);
        return;
    }

    exports.collection = function (name) {
        return mongoose.connection.db.collection(name);
    };

});

// mongoose.set("debug", process.env.NODE_ENV == "dev");
mongoose.set("debug", false);


var db = mongoose.connection;

db.once('open', function () {
    console.log('MongoDB connection successful.');
});
db.on('error', console.error.bind(console, "Database connection:"));



