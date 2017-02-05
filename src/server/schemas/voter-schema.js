'use strict';
const mongoose = require('mongoose');

const spec = {
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  }
};

const schema = new mongoose.Schema(spec);

module.exports = {
  name: 'Voter',
  schema,
  collection: 'voters',
  spec
};
