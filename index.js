let cluster = require('cluster');
require('dotenv').config()

const { env } = require('process');

if(cluster.isMaster && process.env.NODE_ENV !== "dev") {
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
    let session = require('express-session');
    var redisStore = require('connect-redis')(session);
    var redisUtil = require('./lib/redis.js');
    var util = require('./lib/utils');
    var auth = require('./lib/auth.js').initPassport();;
    let passport = require('passport');

    

    app.use("/public", express.static(path.join(__dirname, 'public')));

    // app.use(function (req, res, next) {
    //     //just in case we need a middleware, session check or special handling for static content
    //     next()
    // });
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var client = redisUtil.connection;

    app.use(session({
        secret: 'unbreakable-secret',
        name: 'sid',
        store: new redisStore({host: process.env.REDIS_URI, client: client, ttl: 3600}),
        resave: false,
        saveUninitialized: false,
        rolling: true
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api/documentation', express.static(__dirname + '/public/apidoc'));
    app.use("/aws", require('./app/awsRoutes'));
    app.use("/auth", require('./app/authRoutes'));
    
  

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    

    app.get('/', function(req, res){
     //   console.log(req.user)
        res.render('index', { user: req.user });
      });
      
    app.get('/account', util.ensureAuthenticated, function(req, res){
        res.render('account', { user: req.user });
    });
    
    app.get('/logout', function(req, res){
    req.logout();
        res.redirect('/');
    });

    let server = app.listen(process.env.PORT, function () {

        let host = server.address().address;
        let port = server.address().port;

        console.log("Csgo OnDemand server is running on port "+port);

    });
     
}
