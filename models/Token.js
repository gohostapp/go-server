var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var tokenSchema = new Schema({
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    token: {type: String, required: true},     //can be steamId or email
    is_active: {type: Boolean, default: false}
});


// on every save, add the date
tokenSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

tokenSchema.index({"token": 1}, {unique: true});
tokenSchema.index({"is_active": 1});

var Token = exports.Token  = mongoose.model('Token', tokenSchema);