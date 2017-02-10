'use strict';
const mongoose = require('mongoose');
const schemas = require('./schemas');
const config = require('../../config.json');

const DATABASE_URL = process.env.DATABASE_URL ||
                     config.DATABASE_URL ||
                     'mongodb://localhost/test';
const models = [];
mongoose.Promise = global.Promise;

mongoose.connect(DATABASE_URL);
for(let schema of schemas) {
  models[schema.name] = mongoose.model(schema.name, schema.schema,
                                        schema.collection);
}

function authenticate({id, type, name, pic}) {
  return new Promise(function(resolve, reject) {
    models.User.findOneAndUpdate({
      profileID: id,
      accountType: type
    },
    {
      $set: {
        name: name,
        picture: pic
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    },
    function(err, doc) {
      if(err || !doc) {
        reject(err || (new Error()));
      }
      else {
        resolve(doc);
      }
    });
  });
}

function deserialize(id) {
  return new Promise(function(resolve, reject) {
    models.User.findById(id, function(err, doc) {
      if(err || !doc) {
        reject(err || (new Error()));
      }
      else {
        resolve(doc);
      }
    });
  });
}

function disconnect() {
  return mongoose.disconnect();
}

function createPoll(poll) {
  if(!Array.isArray(poll.options)) return Promise.reject();

  var options = poll.options.slice();
  for(let i = 0; i < options.length; i++) {
    if(!options[i].option) return Promise.reject();
    options[i] = options[i].option.toString().trim();
  }
  options = [...new Set(options)];
  if(options.length > 10 || options.length < 2) return Promise.reject();

  poll.options = options.map( opt => ({option: opt}) );
  return new models.Poll(poll).save();
}

function findPoll(id) {
  return new Promise(function(resolve, reject) {
    models.Poll.findById(id, function(err, doc) {
      if(err || !doc) {
        reject(err || (new Error()));
      }
      else {
        resolve(doc);
      }
    });
  });
}

function searchPoll({query, offset = 0, limit = 10, creator, hot = false}) {
  return models.Poll.find({
          $text: { $search: query },
          creator: creator || {$exists: true}
         })
         .sort(hot ? {count: -1} : {createDate: -1})
         .skip(offset)
         .limit(limit)
         .exec();
}

function listPoll({creator, offset = 0, limit = 10, hot = false} = {}) {
  return models.Poll.find({
           creator: creator || {$exists: true}
         })
         .sort(hot ? {count: -1} : {createDate: -1})
         .skip(offset)
         .limit(limit)
         .exec();
}

function deletePoll({pollID, userID}) {
  return new Promise(function(resolve, reject) {
    models.Poll.findOneAndRemove({
      _id: pollID,
      creator: userID
    }).exec(function(err, doc) {
      if(err || !doc) {
        reject(err || (new Error()));
      }
      else {
        resolve(doc);
      }
    });
  });
}

function vote({pollID, userID, optNum}) {
  return new Promise(function(resolve, reject) {
    models.Poll.findOneAndUpdate({
      _id: pollID,
      voters: { $ne: userID },
      [`options.${optNum}`]: { $exists: true }
    }, {
      $inc: {
        [`options.${optNum}.votes`]: 1,
        count: 1
      },
      $push: {
        voters: userID
      }
    }, {
      new: true,
      runValidators: true
    }, function(err, doc) {
      if(err || !doc) {
        reject(err || (new Error()));
      }
      else {
        resolve(doc);
      }
    });
  });
}

module.exports = {
  models,
  authenticate,
  deserialize,
  disconnect,
  createPoll,
  findPoll,
  deletePoll,
  searchPoll,
  listPoll,
  vote
};
