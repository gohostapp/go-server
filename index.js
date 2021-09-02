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
    let session = require('express-session');
    let SteamStrategy = require('./lib/strategy').Strategy;
    let passport = require('passport');
    var redisStore = require('connect-redis')(session);
    var redisUtil = require('./lib/redis.js');

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete Steam profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


    // Use the SteamStrategy within Passport.
    //   Strategies in passport require a `validate` function, which accept
    //   credentials (in this case, an OpenID identifier and profile), and invoke a
    //   callback with a user object.
    passport.use(new SteamStrategy({
        returnURL: 'http://localhost:8080/auth/steam/return',
        realm: 'http://localhost:8080/',
        apiKey: '93278D41738170B4C02EAD893116495A'
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

        // To keep the example simple, the user's Steam profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Steam account with a user record in your database,
        // and return that user instead.
        profile.identifier = identifier;
            return done(null, profile);
        });
    }
    ));

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
        store: new redisStore({host: process.env.REDIS_URI, client: client, ttl: 1200}),
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
        console.log(req.user)
        res.render('index', { user: req.user });
      });
      
    app.get('/account', ensureAuthenticated, function(req, res){
        console.log("-----");
//        console.log(req.user);
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

    function ensureAuthenticated(req, res, next) {
        console.log("CHECKING ", req.user)
        if (req.isAuthenticated()){ 
            return next(); 
        }
        res.redirect('/');
    }
}
