var mongoose = require('mongoose');

var Schema = mongoose.Schema;

function toLowerCase(val) {
    if (!val)
        return val;
    else
        return val.toLowerCase();
}

// create a schema
var userSchema = new Schema({
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    steam: {type: Schema.Types.Mixed, default: {}}
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

userSchema.index({"steam.steamid": 1}, {unique: true});

var User = exports.User  = mongoose.model('User', userSchema);