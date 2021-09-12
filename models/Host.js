var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    instance_id: {type: Schema.Types.String, required : true,  trim: true},
    instance_type : {type: String,  trim: true},
    launch_time : {type: Date},
    public_ip : {type: String,  trim: true},
    launch_params :  {type: Schema.Types.Mixed, default: {}}
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

userSchema.index({"steam.steamid": 1}, {unique: true});

var User = exports.User  = mongoose.model('User', userSchema);