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
    var cors = require('cors')

    //var redisStore = require('connect-redis')(session);
    //var redisUtil = require('./lib/redis.js');
    var util = require('./lib/utils');
    var auth = require('./lib/auth.js').initPassport();
    let passport = require('passport');
    let consts = require('./constants/consts')
    const HttpError = require('./errors/httpError');
    let httpStatusCodes = require('./constants/httpStatusCodes');

    app.use("/public", express.static(path.join(__dirname, 'public')));

    // app.use(function (req, res, next) {
    //     //just in case we need a middleware, session check or special handling for static content
    //     next()
    // });
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');

    var corsOptions = {
        origin: function (origin, callback) {
          if (consts.ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
          } else {
            callback(new Error('Not allowed by CORS'))
          }
        }
      }

    app.use(function(req,res,next) {
         var reqPath = req.path;
         if(reqPath.indexOf('/api/documentation') == 0){
            if(req.query.password === 'g0ho5tt' ||
                  (reqPath.endsWith('js') || reqPath.endsWith('css') || reqPath.endsWith('map'))){
                 next();
              }else {
                util.sendError(new HttpError(httpStatusCodes.FORBIDDEN, { response: "Forbidden" }), req, res);
                return;
              }
        }else{
            next();
        }
     });

    
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api/documentation', express.static(__dirname + '/public/apidoc'));
    app.options('/server/*', cors(corsOptions))
    app.use("/server", [passport.authenticate('jwt', { session: false }), cors(corsOptions)], require('./app/awsRoutes'));
    app.use("/auth", require('./app/authRoutes'));
    
  

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    

    app.get('/', function(req, res){
     //   console.log(req.user)
        res.render('index', { user: req.user });
      });
      
    app.get('/account', passport.authenticate('jwt', { session: false }), function(req, res){
        console.log(" ==============   ");
        console.log(req.user)
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
