let passport = require('passport');
const HttpError = require('../errors/httpError');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
let SteamStrategy = require('./strategy').Strategy;
let userService = require('../services/userService')

module.exports.initPassport = ()=>{
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
            clientID:     "878321801687-9751a9b2qfs3kv2v9ci3qfl811nfot9g.apps.googleusercontent.com",
            clientSecret: "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",
            callbackURL: "http://localhost:8080/auth/google/return",
            passReqToCallback   : true
        },
        function(request, accessToken, refreshToken, profile, done) {
        //    console.log("GOT GOOGLE PROFILE ", profile)
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
