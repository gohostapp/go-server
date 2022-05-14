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
    let consts = require('./constants/consts')
    

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
        store: new redisStore({host: process.env.REDIS_URI, client: client, ttl: 36000}),
        resave: false,
        saveUninitialized: false,
        rolling: true
    }));


    app.use(function(req,res,next) {
        var isBrowser = false;
        var reqOrigin = req.get("origin");
        var allowedOrigin = reqOrigin;
        if(req.headers['user-agent']){
            var agent = req.headers['user-agent']?.toLowerCase();
            if(reqOrigin && (agent.indexOf('safari') > 0 || agent.indexOf('mozilla') > 0 || agent.indexOf('applewebkit') > 0 || agent.indexOf('chrome') > 0)){
                isBrowser = true;
            }
        }
        if(isBrowser) {
            if(consts.ALLOWED_ORIGINS.indexOf(reqOrigin) >= 0 || process.env.NODE_ENV == "dev"){
                allowedOrigin = reqOrigin;
            }else{
                util.sendError(new httpError(httpStatusCodes.FORBIDDEN, { response: "Unauthorized Origin" }), req, res);
                return;
            }
            res.header("Access-Control-Allow-Origin", allowedOrigin);
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,UPDATE');
            res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control,Accept,set-cookie,withCredentials");
            res.header("Access-Control-Allow-Credentials", true);
            res.header("Access-Control-Expose-Headers", "set-cookie");
            req.session.is_browser = true;
        }
         var reqPath = req.path;
         if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
        }else if(reqPath.indexOf('/api/documentation') == 0){
            if(req.query.password === 'kn1t1fy' ||
                  (reqPath.endsWith('js') || reqPath.endsWith('css') || reqPath.endsWith('map'))){
                 next();
              }else {
                util.sendError(new httpError(httpStatusCodes.FORBIDDEN, { response: "Forbidden" }), req, res);
                return;
              }
        }else{
            next();
        }
     });

    
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api/documentation', express.static(__dirname + '/public/apidoc'));
    app.use("/server", require('./app/awsRoutes'));
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
