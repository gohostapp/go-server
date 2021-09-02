var express = require('express')
  , router = express.Router()
  , passport = require('passport');
let mongo = require('../models/mongo')

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

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/steam/return',
  // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
    function(req, res, next) {
        console.log("I AM HERE !!! LET US SEEE ----- ")
        console.log(req.url)
        console.log(req.originalUrl)
        req.url = req.originalUrl;
        next();
    }, 
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
   //   console.log(req.user);
      console.log("IN HERE FINAL REDIREC")
      res.redirect('/');
});

module.exports = router;