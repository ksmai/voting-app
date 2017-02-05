'use strict';
const mongoose = require('mongoose');

const spec = {
  title: {
    type: String,
    maxlength: 256,
    minlength: 1,
    required: true,
    trim: true
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  options: {
    type: [{
      option: {
        type: String,
        maxlength: 128,
        minlength: 1,
        required: true,
        trim: true
      },
      votes: {
        type: Number,
        default: 0
      }
    }],
    validate: function(options) {
      return Array.isArray(options) && options.length > 1;
    },
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  }
};

const schema = new mongoose.Schema(spec);

module.exports = {
  name: 'Poll',
  schema,
  collection: 'polls',
  spec
};
