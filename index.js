var cluster = require('cluster');
require('dotenv').config()

const { env } = require('process');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    var express = require('express');
    var path = require('path');
    var app = express();



    var consts = require('./lib/consts.js');

    //folder to 
    app.use("/public", express.static(path.join(__dirname, 'public')));


    app.use(function (req, res, next) {
        //just in case we need a middleware, session check or special handling for static content
        next()
    });
    
    
    app.use("/aws", require('./app/awsRoutes'));


    var server = app.listen(process.env.PORT, function () {

        var host = server.address().address;
        var port = server.address().port;

        console.log("Csgo OnDemand server is running on port "+port);

    });
}
