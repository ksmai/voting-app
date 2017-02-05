'use strict';
const express = require('express');
const path = require('path');

const BIN_PATH = path.join(__dirname, '../../bin');
const ASSETS_PATH = path.join(__dirname, '../../assets');

const app = express();
app.use(express.static(BIN_PATH));
app.use(express.static(ASSETS_PATH));

app.get('/*',
  function(req, res) {
    res.sendFile('index.html', {
      root: BIN_PATH
    });
  }
);

app.use(function(err, req, res, next) {
  res.status(500).end();
});

module.exports = app;
