let cluster = require('cluster');
require('dotenv').config()

const { env } = require('process');

if(cluster.isMaster) {
    let numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(let i = 0; i < numWorkers; i++) {
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
    let express = require('express');
    let path = require('path');
    let app = express();



    let consts = require('./constants/consts.js');

    //folder to 
    app.use("/public", express.static(path.join(__dirname, 'public')));


    app.use(function (req, res, next) {
        //just in case we need a middleware, session check or special handling for static content
        next()
    });
    
    
    app.use("/aws", require('./app/awsRoutes'));


    let server = app.listen(process.env.PORT, function () {

        let host = server.address().address;
        let port = server.address().port;

        console.log("Csgo OnDemand server is running on port "+port);

    });
}
