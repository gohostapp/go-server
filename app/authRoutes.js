var express = require('express')
  , router = express.Router()
  , passport = require('passport');
  var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

let userService = require("../services/userService");

const jwt = require('jsonwebtoken');


// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
router.get('/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

router.get('/steam',
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/steam/return',
  // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
    function(req, res, next) {
        req.url = req.originalUrl;
        next();
    }, 
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
      //  console.log(req.user);
        console.log("IN HERE FINAL REDIREC")
        userService.authUser(req.user._json, "steam")
        .then(user => {
            req.user._id = user._id;
            res.redirect('/');
        })
        .catch((err) => {
          console.log("GOT ERROR ", err)
            res.redirect('/');
        });
      
});

router.get('/google',
passport.authenticate('google', { scope:[ 'email', 'profile' ] }),
  function(req, res) {
    res.redirect('/');
});




router.get('/google/return',
  // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
    function(req, res, next) {
        req.url = req.originalUrl;
        next();
    }, 
    passport.authenticate( 'google'),
    function(req, res) {
        //console.log(req.user);
        let token = jwt.sign({
            data: req.user
          }, process.env.JWT_SECRET, { expiresIn: "10h" });
        res.redirect(process.env.DASHBOARD_URI+`?jwt=${token}`);
});


module.exports = router;