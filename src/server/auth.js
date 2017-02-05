'use strict';
const config = require('../../config.json');
const ensureLogin = require('./ensure-login');
const express = require('express');
const passport = require('passport');
const FBStrategy = require('passport-facebook').Strategy;
const TWStrategy = require('passport-twitter').Strategy;
const GHStrategy = require('passport-github').Strategy;

passport.use(new FBStrategy({
    clientID: process.env.FB_CLIENT_ID || config.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET || config.FB_CLIENT_SECRET,
    callbackURL: '/auth/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.use(new TWStrategy({
    consumerKey: process.env.TW_CONSUMER_KEY || config.TW_CONSUMER_KEY,
    consumerSecret: process.env.TW_CONSUMER_SECRET ||
                    config.TW_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }
));

passport.use(new GHStrategy({
    clientID: process.env.GH_CLIENT_ID || config.GH_CLIENT_ID,
    clientSecret: process.env.GH_CLIENT_SECRET || config.GH_CLIENT_SECRET,
    callbackURL: '/auth/github/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

function setupAuth(app) {
  app.use(require('express-session')({
    secret: 'some secrets',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/facebook',
          ensureLogin(false),
          passport.authenticate('facebook')
  );

  app.get('/auth/facebook/return', passport.authenticate('facebook'),
      function(req, res) {
        res.end();
      }
  );

  app.get('/auth/twitter',
          ensureLogin(false),
          passport.authenticate('twitter')
  );

  app.get('/auth/twitter/return', passport.authenticate('twitter'),
      function(req, res) {
        res.end();
      }
  );

  app.get('/auth/github',
          ensureLogin(false),
          passport.authenticate('github')
  );

  app.get('/auth/github/return', passport.authenticate('github'),
      function(req, res) {
        res.end();
      }
  );

  app.get('/auth/me',
          ensureLogin(),
          function(req, res) {
            res.send(req.user || 'not logged in');
          }
  );

  app.get('/auth/logout', function(req, res) {
    req.logout();
    res.end();
  });

  return app;
}

module.exports = setupAuth;
