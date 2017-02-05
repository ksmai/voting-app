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
            res.status(400).end();
          });
        }
);

api.post('/create_poll',
         ensureLogin(),
         bodyParser.json(),
         function(req, res) {
           if(!req.body.title || !req.body.options) {
             res.status(400).end();
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
                 poll: doc._id;
               });
             })
             .catch(function(err) {
               res.status(400).end();
             });
           }
         }
);

api.delete('/delete_poll/:id',
           ensureLogin(),
           function(req, res) {
             db
             .deletePoll({
               pollId: req.params.id,
               userId: req.user._id
             })
             .then(function() {
               res.end();
             })
             .catch(function() {
               res.status(400).end();
             });
           }
);

module.exports = api;
