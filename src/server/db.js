'use strict';
const mongoose = require('mongoose');
const schemas = require('./schemas');
const config = require('../../config.json');

const DATABASE_URL = process.env.DATABASE_URL ||
                     config.DATABASE_URL ||
                     'mongodb://localhost/test';
const models = [];
mongoose.Promise = Promise;

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
        reject(err || new Error());
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
        reject(err || new Error);
      }
      else {
        resolve(doc);
      }
    });
  });
}

function disconnect() {
  mongoose.disconnect();
}

function createPoll(poll) {
  return new models.Poll(poll).save();
}

function findPoll(id) {
  return new Promise(function(resolve, reject) {
    models.Poll.findById(id, function(err, doc) {
      if(err || !doc) {
        reject(err || new Error());
      }
      else {
        resolve(doc);
      }
    });
  });
}

function deletePoll({pollId, userId}) {
  return models.Poll.findOneAndRemove({
    _id: pollId,
    creator: userId
  }).exec();
}

module.exports = {
  authenticate,
  deserialize,
  disconnect,
  createPoll,
  findPoll,
  deletePoll
};
