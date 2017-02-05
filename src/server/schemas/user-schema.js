'use strict';
const mongoose = require('mongoose');

const spec = {
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  profileID: {
    type: Number,
    required: true
  },
  accountType: {
    type: String,
    enum: ['facebook', 'github', 'twitter'],
    required: true
  },
  registerDate: {
    type: Date,
    default: Date.now
  }
};

const schema = new mongoose.Schema(spec);

module.exports = {
  name: 'User',
  schema: schema,
  collection: 'users',
  spec: spec
};
