let passport = require('passport');
const HttpError = require('../errors/httpError');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
let SteamStrategy = require('./strategy').Strategy;
let userService = require('../services/userService');
let consts = require("../constants/consts")
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports.initPassport = ()=>{

    var opts = {}
    // opts.jwtFromRequest = function(req) { // tell passport to read JWT from cookies
    //     var token = null;
    //     if (req && req.query){
    //         token = req.query['jwt']
    //     }

    //     return token
    // }

    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
    opts.secretOrKey = process.env.JWT_SECRET;

    // main authentication, our app will rely on it
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        if (jwt_payload.data._id) {
            console.log("yES")
            return done(null, jwt_payload.data)
        } else {
            // user account doesnt exists in the DATA
            return done(new HttpError(httpStatusCodes.FORBIDDEN, { response: "Unauthorized Request" }), req, res);
          //  return done(null, false)
        }
    }))


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
            returnURL: `${process.env.HOST_URL}auth/steam/return`,
            realm: process.env.HOST_URL,
            apiKey: process.env.STEAM_API_KEY
        },
        function(identifier, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {
                profile.identifier = identifier;
                userService.authUser(profile, "steam")
                .then(user => {
                    return done(null, user);
                })
                .catch((err) => {
                    return done(new HttpError(consts.BAD_REQUEST, { response: 'Invalid ID' }), null)
                });

            });
        }
    ));


    passport.use(new GoogleStrategy({
            clientID:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.HOST_URL}auth/google/return`,
            passReqToCallback   : true
        },
        function(request, accessToken, refreshToken, profile, done) {
            userService.authUser(profile._json, "google")
            .then(user => {
                return done(null, user);
            })
            .catch((err) => {
                return done(new HttpError(consts.BAD_REQUEST, { response: 'Invalid ID' }), null)
            });
            
        }
    ));

    
}
