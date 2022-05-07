var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    identifier: {type: String, required: true},     //can be steamId or email
    google: {type: Schema.Types.Mixed, default: {}},
    steam: {type: Schema.Types.Mixed, default: {}}
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

userSchema.index({"identifier": 1}, {unique: true});

var User = exports.User  = mongoose.model('User', userSchema);