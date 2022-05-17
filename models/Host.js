var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var hostSchema = new Schema({
    user: {type: Schema.Types.ObjectId, index: true, required: true, ref: "User"},
    created_at: {type: Date, required: true, default: Date.now},
    updated_at: {type: Date, required: true, default: Date.now},
    instance_id: {type: Schema.Types.String, required : true,  trim: true},
    public_ip : {type: String,  trim: true},
    launch_params :  {type: Schema.Types.Mixed, default: {}},
    is_active : {type: Boolean, default: true},
    private_key : {type: String,  trim: true}
});


// on every save, add the date
hostSchema.pre('save', function(next) {
    // change the updated_at field to current date
    this.updated_at =  new Date();
    next();
});

hostSchema.index({"is_active": 1});
hostSchema.index({"user": 1});

hostSchema.methods.sanitized = function () {
    var data = this.toObject();
    delete data["private_key"];
    delete data["updated_at"];
    delete data["instance_id"];
    delete data["user"];
    delete data["launch_params"]?.["steam_server_token"];
    return data;
};

var Host = exports.Host  = mongoose.model('Host', hostSchema);