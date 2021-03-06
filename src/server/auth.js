'use strict';
const config = require('../../config.json');
const db = require('./db');
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
    db
    .authenticate({
      id: profile.id,
      type: 'facebook',
      pic: `http://graph.facebook.com/${profile.id.toString()}/picture?type=large`,
      name: profile.displayName || profile.username
    })
    .then(function(user) {
      cb(null, user);
    })
    .catch(function(err) {
      cb(err);
    });
  }
));

passport.use(new TWStrategy({
    consumerKey: process.env.TW_CONSUMER_KEY || config.TW_CONSUMER_KEY,
    consumerSecret: process.env.TW_CONSUMER_SECRET ||
                    config.TW_CONSUMER_SECRET,
    callbackURL: '/auth/twitter/return'
  },
  function(token, tokenSecret, profile, cb) {
    db
    .authenticate({
      id: profile.id,
      type: 'twitter',
      name: profile.displayName || profile.username,
      pic: profile.photos[0].value
    })
    .then(function(user) {
      cb(null, user);
    })
    .catch(function(err) {
      cb(err);
    });
  }
));

passport.use(new GHStrategy({
    clientID: process.env.GH_CLIENT_ID || config.GH_CLIENT_ID,
    clientSecret: process.env.GH_CLIENT_SECRET || config.GH_CLIENT_SECRET,
    callbackURL: '/auth/github/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    db
    .authenticate({
      id: profile.id,
      type: 'github',
      name: profile.displayName || profile.username,
      pic: profile.photos[0].value
    })
    .then(function(user) {
      cb(null, user);
    })
    .catch(function(err) {
      cb(err);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
  db.deserialize(id)
  .then(function(user) {
    cb(null, user);
  })
  .catch(function(err) {
    cb(err);
  });
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
          saveReferrer,
          passport.authenticate('facebook')
  );

  app.get('/auth/facebook/return',
          passport.authenticate('facebook', {
            failureRedirect: '/'
          }),
          returnToReferrer
  );

  app.get('/auth/twitter',
          ensureLogin(false),
          saveReferrer,
          passport.authenticate('twitter')
  );

  app.get('/auth/twitter/return',
          passport.authenticate('twitter', {
            failureRedirect: '/'
          }),
          returnToReferrer
  );

  app.get('/auth/github',
          ensureLogin(false),
          saveReferrer,
          passport.authenticate('github')
  );

  app.get('/auth/github/return',
          passport.authenticate('github', {
            failureRedirect: '/'
          }),
          returnToReferrer
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

function saveReferrer(req, res, next) {
  req.session.returnTo = req.header('Referrer');
  next();
}

function returnToReferrer(req, res) {
  if( req.session.returnTo.match(/error/i) ) {
    delete req.session.returnTo;
  }
  res.redirect( req.session.returnTo || '/' );
  delete req.session.returnTo;
}

module.exports = setupAuth;
