'use strict';
const express = require('express');
const db = require('./db');
const ensureLogin = require('./ensure-login');
const bodyParser = require('body-parser');

const api = express.Router();
api.get('/poll/:id',
        function(req, res) {
          db
          .findPoll(req.params.id)
          .then(function(doc) {
            res.json(doc)
          })
          .catch(function(err) {
            res.status(404).end();
          });
        }
);

api.post('/create_poll',
         ensureLogin(),
         bodyParser.json(),
         function(req, res) {
           if(!req.body.title || !req.body.options) {
             return res.status(400).end();
           }
           else {
             db
             .createPoll({
               creator: req.user._id,
               title: req.body.title,
               options: req.body.options
             })
             .then(function(doc) {
               res.json({
                 pollID: doc._id
               });
             })
             .catch(function(err) {
               res.status(400).end();
             });
           }
         }
);

api.get('/search/:query',
        function(req, res) {
          const limit = 50,
                offset = parseInt(req.query.offset) || 0,
                query = req.params.query;
          db.searchPoll({ limit, offset, query })
            .then(function(polls) {
              res.json(polls);
            })
            .catch(function(err) {
              res.status(400).end();
            });
        }
);

api.get('/ownsearch/:query',
        ensureLogin(),
        function(req, res) {
          db.searchPoll({
            limit: 50,
            query: req.params.query,
            offset: parseInt(req.query.offset) || 0,
            creator: req.user._id
          })
          .then(function(polls) {
            res.json(polls);
          })
          .catch(function(err) {
            res.status(400).end();
          });
        }
);

api.get('/list',
        function(req, res) {
          db.listPoll({
            limit: 50,
            offset: parseInt(req.query.offset) || 0,
            hot: req.query.hot != void(0)
          })
          .then(function(polls) {
            res.json(polls);
          })
          .catch(function(err) {
            res.status(400).end();
          });
        }
);

api.get('/ownlist',
        ensureLogin(),
        function(req, res) {
          db.listPoll({
            limit: 50,
            offset: parseInt(req.query.offset) || 0,
            creator: req.user._id
          })
          .then(function(polls) {
            res.json(polls);
          })
          .catch(function(err) {
            res.status(400).end();
          });
        }
);


api.delete('/delete_poll/:id',
           ensureLogin(),
           function(req, res) {
             db
             .deletePoll({
               pollID: req.params.id,
               userID: req.user._id
             })
             .then(function() {
               res.end();
             })
             .catch(function() {
               res.status(400).end();
             });
           }
);

api.put('/vote',
        ensureLogin(),
        bodyParser.json(),
        function(req, res) {
          db.vote({
            userID: req.user._id,
            pollID: req.body.pollID,
            optNum: parseInt(req.body.optNum)
          })
          .then(function(doc) {
            res.end();
          })
          .catch(function(err) {
            res.status(400).end();
          });
        }
);

module.exports = api;
