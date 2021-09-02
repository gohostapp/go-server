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
    email:  {type: String, trim: true, set: toLowerCase},
    name: {type: String,  trim: true},
    photo_url: {type: String,  trim: true},
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    vendor_id: {type: String,  trim: true},
    vendor: {type: String, required: true,  enum: ["steam", "facebook", "google"]},
    vendor_data: {type: Schema.Types.Mixed, default: {}}
});


// on every save, add the date
userSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

userSchema.index({vendor_id: 1, vendor: 1}, {unique: true});
userSchema.index({vendor_id: 1});
userSchema.index({email: 1});


var User = exports.User  = mongoose.model('User', userSchema);