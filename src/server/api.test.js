'use strict';
const api = require('./api');
const db = require('./db');
const assert = require('chai').assert;
const superagent = require('superagent');
const express = require('express');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const testUser = {
  _id: '589874ed9405f2c3e455db73',
  name: 'Test User',
  profileID: 123456,
  picture: 'test-picture',
  accountType: 'github'
};
const testPoll = {
  title: 'A new poll for testing',
  options: [
    { option: 'test option 1/3' },
    { option: 'test option 2/3' },
    { option: 'test option 3/3' }
  ]
};
var testPollID;
var server;

describe('authenticated user', function() {
  before(function(done) {
    const app = express();
    app.use(function(req, res, next) {
      req.user = testUser;
      req.isAuthenticated = () => true;
      next();
    });
    app.use(api);

    server = app.listen(PORT, function() {
      Promise.all([
        db.models.User.remove({}),
        db.models.Poll.remove({})
      ])
      .then(function() {
        return (new db.models.User(testUser)).save();
      })
      .then(function() {
        done();
      });
    });
  });

  after(function(done) {
    server.close(function() {
      done();
    });
  });

  it('can post new poll', function(done) {
    superagent
    .post(`${BASE_URL}/create_poll`)
    .send(testPoll)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.doesNotThrow(function() {
        testPollID = res.body.pollID;
      });
      assert.isOk( testPollID );
      done();
    });
  });

  it('can list polls by all users', function(done) {
    superagent
    .get(`${BASE_URL}/list`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
                      testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can list own polls', function(done) {
    superagent
    .get(`${BASE_URL}/ownlist`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can request a poll by ID', function(done) {
    superagent
    .get(`${BASE_URL}/poll/${testPollID}`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body.voters) );
      assert.equal( res.body.voters.length, 0 );
      assert.equal( res.body.options.length, testPoll.options.length );
      assert.equal( res.body.title, testPoll.title.trim() );
      assert.equal( res.body.creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can search all available polls', function(done) {
    superagent
    .get(`${BASE_URL}/search/test`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can search all own polls', function(done) {
    superagent
    .get(`${BASE_URL}/ownsearch/test`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can vote on a poll', function(done) {
    superagent
    .put(`${BASE_URL}/vote`)
    .send({
      pollID: testPollID,
      optNum: 1
    })
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      superagent
      .get(`${BASE_URL}/poll/${testPollID}`)
      .end(function(err, res) {
        assert.ifError(err);
        assert.equal(res.status, 200);
        assert.equal(res.body.title, testPoll.title);
        assert.equal(res.body.options[0].votes, 0);
        assert.equal(res.body.options[1].votes, 1);
        assert.equal(res.body.options[2].votes, 0);
        assert.include(res.body.voters, testUser._id);
        done();
      });
    });
  });

  it('can delete a poll', function(done) {
    superagent
    .delete(`${BASE_URL}/delete_poll/${testPollID}`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      superagent
      .get(`${BASE_URL}/poll/${testPollID}`)
      .end(function(err, res) {
        assert.isOk(err);
        assert.equal(res.status, 404);
        done();
      });
    });
  });
});

describe('unauthenticated user', function() {
  before(function(done) {
    const app = express();
    app.use(function(req, res, next) {
      req.isAuthenticated = () => false;
      next();
    });
    app.use(api);
    server = app.listen(PORT, function() {
      (new db.models.Poll(Object.assign({
        _id: testPollID,
        creator: testUser._id
      }, testPoll)))
      .save()
      .then(function() {
        done();
      });
    });
  });

  after(function(done) {
    server.close(function() {
      db.disconnect().then(function() {
        done();
      });
    });
  });

  it('cannot post new poll', function(done) {
    superagent
    .post(`${BASE_URL}/create_poll`)
    .send(testPoll)
    .end(function(err, res) {
      assert.isOk(err);
      assert.equal(res.status, 401);
      done();
    });
  });

  it('can list polls by all users', function(done) {
    superagent
    .get(`${BASE_URL}/list`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
                      testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('cannot list own polls', function(done) {
    superagent
    .get(`${BASE_URL}/ownlist`)
    .end(function(err, res) {
      assert.isOk(err);
      assert.equal(res.status, 401);
      done();
    });
  });

  it('can request a poll by ID', function(done) {
    superagent
    .get(`${BASE_URL}/poll/${testPollID}`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.equal( res.body.options.length, testPoll.options.length );
      assert.equal( res.body.title, testPoll.title.trim() );
      assert.equal( res.body.creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('can search all available polls', function(done) {
    superagent
    .get(`${BASE_URL}/search/test`)
    .end(function(err, res) {
      assert.ifError(err);
      assert.equal(res.status, 200);
      assert.isOk( Array.isArray(res.body) );
      assert.equal( res.body.length, 1 );
      assert.equal( res.body[0].options.length, testPoll.options.length );
      assert.equal( res.body[0].title, testPoll.title.trim() );
      assert.equal( res.body[0].creator, testUser._id );
      for(let i = 0; i < testPoll.length; i++) {
        assert.equal( res.body[0].options[i].option,
          testPoll.options[i].option.trim());
        assert.equal( res.body[0].options[i].votes, 0 );
      }
      done();
    });
  });

  it('cannot search all own polls', function(done) {
    superagent
    .get(`${BASE_URL}/ownsearch/test`)
    .end(function(err, res) {
      assert.isOk(err);
      assert.equal(res.status, 401);
      done();
    });
  });

  it('cannot vote on a poll', function(done) {
    superagent
    .put(`${BASE_URL}/vote`)
    .send({
      pollID: testPollID,
      optNum: 1
    })
    .end(function(err, res) {
      assert.isOk(err);
      assert.equal(res.status, 401);
      superagent
      .get(`${BASE_URL}/poll/${testPollID}`)
      .end(function(err, res) {
        assert.ifError(err);
        assert.equal(res.status, 200);
        assert.equal(res.body.title, testPoll.title);
        assert.equal(res.body.options[0].votes, 0);
        assert.equal(res.body.options[1].votes, 0);
        assert.equal(res.body.options[2].votes, 0);
        done();
      });
    });
  });

  it('cannot delete a poll', function(done) {
    superagent
    .delete(`${BASE_URL}/delete_poll/${testPollID}`)
    .end(function(err, res) {
      assert.isOk(err);
      assert.equal(res.status, 401);
      superagent
      .get(`${BASE_URL}/poll/${testPollID}`)
      .end(function(err, res) {
        assert.ifError(err);
        assert.equal(res.status, 200);
        assert.equal(res.body.title, testPoll.title);
        assert.equal(res.body.options[0].votes, 0);
        assert.equal(res.body.options[1].votes, 0);
        assert.equal(res.body.options[2].votes, 0);
        assert.equal(res.body.voters.length, 0);
        done();
      });
    });
  });
});
