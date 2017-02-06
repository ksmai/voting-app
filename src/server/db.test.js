'use strict';
const db = require('./db');
const assert = require('chai').assert;
const testData = require('./db.test.json');

describe('Database operations', function() {
  beforeEach(function() {
    var removes = [];
    for(let key in db.models) {
      if(db.models.hasOwnProperty(key)) {
        removes.push(db.models[key].remove({}));
      }
    }

    return Promise
           .all(removes)
           .then(function() {
              var inserts = [];
              for(let model in testData) {
                if(testData.hasOwnProperty(model)) {
                  for(let doc of testData[model]) {
                    inserts.push((new db.models[model](doc)).save());
                  }
                }
              }
              return Promise.all(inserts);
           });
  });

  after(function() {
    return db.disconnect();
  });

  it('can authenticate existing user', function() {
    var len = testData.User.length;
    var n = Math.floor( Math.random() * len );
    var user = testData.User[n];

    return db.authenticate({
      id: user.profileID,
      type: user.accountType,
      name: user.name,
      pic: user.picture
    }).then(function() {
      return db.models.User.find({}).exec();
    }).then(function(docs) {
      assert.equal(docs.length, len)
    });
  });

  it('can update existing user\'s name/pic', function() {
    var len = testData.User.length;
    var n = Math.floor( Math.random() * len );
    var user = testData.User[n];
    const newName = 'A new name for me',
          newPic = 'My good new picture';

    return db.authenticate({
       id: user.profileID,
       type: user.accountType,
       name: newName,
       pic: newPic
    }).then(function() {
      return db.models.User.find({}).exec();
    }).then(function(docs) {
      assert.equal(docs.length, len)
      assert.isOk( docs.some(function(doc) {
        return doc.profileID === user.profileID &&
               doc.accountType === user.accountType &&
               doc.name === newName &&
               doc.picture === newPic;
      }));
    });
  });

  it('can authenticate a new user', function() {
    var len = testData.User.length;
    const newUser = {
      id: 999420,
      type: 'twitter',
      name: 'a new user',
      pic: 'a pic of new user'
    };

    return db.models.User.findOne({
             accountType: newUser.type,
             profileID: newUser.id
           }).exec()
           .then(function(doc) {
             assert.isNotOk(doc);
             return db.authenticate(newUser);
           })
           .then(function() {
             return db.models.User.find({}).exec();
           })
           .then(function(docs) {
             assert.equal(docs.length, len + 1)
             assert.isOk( docs.some(function(doc) {
               return doc.profileID === newUser.id &&
                      doc.accountType === newUser.type &&
                      doc.name === newUser.name &&
                      doc.picture === newUser.pic;
             }));
           });
  });

  it('can deserialize a user id', function() {
    var promises = [];
    for(let user of testData.User) {
      promises.push(
        db.deserialize(user._id).then(function(doc) {
          assert.equal(doc.profileID, user.profileID);
          assert.equal(doc.name, user.name);
          assert.equal(doc.picture, user.picture);
          assert.equal(doc.accountType, user.accountType);
          return;
        })
      );
    }
    return Promise.all(promises);
  });

  it('can reject deserialization of invalid user id', function() {
    const nonExistentID = '5897fd190db75f124c89578d';
    const invalidID = 'abc';
    return db.models.User.findById(nonExistentID).exec()
             .then(function(doc) {
               if(doc) return Promise.reject();
               return db.deserialize(nonExistentID);
             })
             .then(function() {
               return Promise.reject();
             }, function() {
               return db.deserialize(invalidID);
             })
             .then(function() {
               return Promise.reject();
             }, function() {
               return Promise.resolve();
             });
  });

  it('can create a new poll', function() {
    const len = testData.Poll.length;
    const newPoll = {
      title: 'Title of a new poll',
      creator: '5897fb1f35be320f48b89d5e',
      options: [
        { option: 'new poll - option 1' },
        { option: 'new poll - option 2' },
        { option: 'new poll - option 3' }
      ]
    };

    return db.createPoll(newPoll)
             .then(function(doc) {
               assert.equal(newPoll.title, doc.title);
               assert.equal(newPoll.creator, doc.creator);
               assert.equal(newPoll.options.length, doc.options.length);
               for(let i = 0; i < doc.options.length; i++) {
                 assert.equal(newPoll.options[i].option,
                              doc.options[i].option);
               }
               assert.isOk(doc._id);
               return db.models.Poll.find({}).exec();
             })
             .then(function(docs) {
               assert.equal(docs.length, len + 1);
               assert.isOk( docs.some(function(doc) {
                 return doc.creator == newPoll.creator &&
                        doc.title === newPoll.title;
               }));
             });
  });

  it('can reject invalid new poll', function() {
    const len = testData.Poll.length;
    const emptyTitle = {
      title: '    ',
      creator: '5897fb1f35be320f48b89d5e',
      options: [
        { option: 'new poll - option 1' },
        { option: 'new poll - option 2' },
        { option: 'new poll - option 3' }
      ]
    };
    const invalidCreator = {
      title: 'title',
      creator: 'abc',
      options: [
        { option: 'new poll - option 1' },
        { option: 'new poll - option 2' },
        { option: 'new poll - option 3' }
      ]
    };
    const onlyOneOption = {
      title: 'title',
      creator: '5897fb1f35be320f48b89d5e',
      options: [
        { option: 'new poll - option 1' }
      ]
    };
    const emptyOption = {
      title: 'title',
      creator: '5897fb1f35be320f48b89d5e',
      options: [
        { option: '  ' },
        { option: 'new poll - option 1' }
      ]
    };
    const invalidPolls = [emptyTitle, invalidCreator,
                          onlyOneOption, emptyOption];
    const promises = invalidPolls.map( function(poll) {
      return db.createPoll(poll)
               .then( function() {
                 return Promise.reject(poll);
               }, function() {
                 return Promise.resolve();
               });
    });

    return Promise.all(promises)
                  .then(function() {
                    return db.models.Poll.find({}).exec();
                  })
                  .then(function(docs) {
                    assert.equal(docs.length, len);
                  });
  });

  it('can find a poll by id', function() {
    var n = Math.floor( Math.random() * testData.Poll.length );
    var poll = testData.Poll[n];
    return db.findPoll(poll._id)
             .then(function(doc) {
               assert.equal(doc._id, poll._id);
               assert.equal(doc.title, poll.title.trim());
               assert.equal(doc.creator, poll.creator);
               assert.equal(doc.options.length, poll.options.length);
               for(let i = 0; i < doc.options.length; i++) {
                 assert.equal(doc.options[i].option,
                              poll.options[i].option);
               }
             });
  });

  it('can reject invalid poll id', function() {
    var invalids = [
      'abc',
      '',
      '5897fb1f35be320f48b89d5e'
    ].map(function(id) {
      return db.findPoll(id)
               .then(function() {
                 return Promise.reject();
               }, function() {
                 return Promise.resolve();
               });
    });

    return Promise.all(invalids);
  });

  it('can search poll title by text', function() {
    var searches = [
      db.searchPoll({query: 'facebook'})
        .then(function(doc) {
          assert.equal(doc.length, 1);
          assert.equal(doc[0]._id, '5897fd190db75f124c89578f');
        }),

      db.searchPoll({query: 'poll'})
        .then(function(docs) {
          assert.equal(docs.length, 3);
        }),

      db.searchPoll({query: 'rbrbtebeb'})
        .then(function(docs) {
          assert.equal(docs.length, 0);
        })
    ];

    return Promise.all(searches);
  });

  it('can search poll created by certain user', function() {
    const user = "5897fb1f35be320f48b89d5d";

    var searches = [
      db.searchPoll({query: 'github', creator: user})
        .then(function(doc) {
          assert.equal(doc.length, 1);
          assert.equal(doc[0]._id, '5897fd190db75f124c89578e');
        }),

      db.searchPoll({query: 'facebook', creator: user})
        .then(function(docs) {
          assert.equal(docs.length, 0);
        }),

      db.searchPoll({query: 'twitter', creator: user})
        .then(function(docs) {
          assert.equal(docs.length, 0);
        })
    ];

    return Promise.all(searches);
  });

  it('can list polls from all users', function() {
    return db.listPoll()
             .then(function(docs) {
                assert.equal(docs.length, testData.Poll.length);
             });
  });

  it('can list polls from specific user', function() {
    const user = "5897fb1f35be320f48b89d5d";

    return db.listPoll({creator: user})
             .then(function(docs) {
               assert.equal(docs.length, 1);
               assert.equal(docs[0]._id, '5897fd190db75f124c89578e');
             });
  });

  it('can delete a poll given the creator ID', function() {
    var n = Math.floor( Math.random() * testData.Poll.length );
    var poll = testData.Poll[n];

    return db.deletePoll({pollID: poll._id, userID: poll.creator})
             .then(function() {
               return db.models.Poll.find({});
             })
             .then(function(docs) {
               assert.equal(docs.length, testData.Poll.length - 1);
               assert.isOk( docs.every(function(doc) {
                 return doc._id != poll._id;
               }));
             });
  });

  it('can reject delete request with wrong poll/user ID', function() {
    var len = testData.Poll.length;
    var n = Math.floor( Math.random() * len );
    var pollToDel = testData.Poll[n];
    var wrongPoll = testData.Poll[(n + 1) % len];

    return db.deletePoll({pollID: pollToDel._id, userID: wrongPoll.creator})
             .then(function() {
               return Promise.reject();
             }, function() {
               return db.models.Poll.find({});
             })
             .then(function(docs) {
               assert.equal(docs.length, len);
               assert.isOk( docs.some(function(doc) {
                 return doc._id == pollToDel._id;
               }));
               assert.isOk( docs.some(function(doc) {
                 return doc._id == wrongPoll._id;
               }));
             });
  });

  it('can vote on a poll', function() {
    const vote = {
      userID: '5897fb1f35be320f48b89d5e',
      pollID: '5897fd190db75f124c89578f',
      optNum: 0
    };

    return db.vote(vote)
             .then(function(doc) {
               assert.equal( doc.voters.length, 1 );
               assert.equal( doc.voters[0], vote.userID );
               assert.equal( doc._id, vote.pollID );
               assert.equal( doc.options[vote.optNum].votes, 1 );
             });
  });

  it('can reject votes with invalid pollID/optNum', function() {
    const invID = {
      userID: '5897fb1f35be320f48b89d5e',
      pollID: '5897fb1f35be320f48b89d5e',
      optNum: 0
    };
    const invNum = {
      userID: '5897fb1f35be320f48b89d5e',
      pollID: '5897fd190db75f124c89578f',
      optNum: 3
    };


    return db.vote(invID)
           .then(function() {
             return Promise.reject();
           }, function() {
             return db.vote(invNum);
           })
           .then(function() {
             return Promise.reject();
           }, function() {
             return Promise.resolve();
           });

  });

  it('can detect and reject excess votes from a user', function() {
    const vote = {
      userID: '5897fb1f35be320f48b89d5e',
      pollID: '5897fd190db75f124c89578f',
      optNum: 0
    };

    return db.vote(vote)
             .then(function(doc) {
               assert.equal( doc.options[optNum].votes, 1 );
               return db.vote(vote);
             })
             .then(function() {
               return Promise.reject();
             }, function() {
               return db.models.Poll.findById(vote.pollID).exec();
             })
             .then(function(doc) {
               if(!doc) return Promise.reject();
               assert.equal(doc.options[vote.optNum].votes, 1);
             });
  });

});
