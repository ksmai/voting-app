'use strict';

var testUser = {
  _id: 123456,
  name: 'Test User',
  picture: 'test pic'
};

var testPolls = [];
for(let i = 0; i < 100; i++) {
  testPolls.push({
    _id: i,
    title: 'Title for poll ' + i,
    options: [
      { option: `poll ${i} - 1`, votes: i },
      { option: `poll ${i} - 2`, votes: i }
    ],
    voters: [],
    createDate: '2016-01-01T04:42:42Z'
  });
}

describe('End to end tests', function() {
  var injector, scope, httpBackend, element, compile;

  beforeEach(function() {
    injector = angular.injector(['voting', 'ngMock', 'ngMockE2E']);
    injector.invoke(function($rootScope, $compile, $httpBackend) {
      scope = $rootScope.$new();
      $httpBackend.whenGET(/^\/templates\/.+/).passThrough();
      httpBackend = $httpBackend;
      compile = $compile;
    });
  });

  afterEach(function() {
    httpBackend.verifyNoOutstandingRequest();
    httpBackend.verifyNoOutstandingExpectation();
  });

  describe('voteHeader', function() {
    beforeEach(function() {
      element = compile('<vote-header></vote-header>')(scope);
      scope.$apply();
    });

    it('should show logged in user picture/name', function(done) {
      httpBackend.expectGET('/auth/me').respond(testUser);

      scope.$on('headerCtrl', function() {
        httpBackend.flush();
        var img = visible(element.find('label[for="user-nav-state"] img'));
        var name =visible(element.find('label[for="user-nav-state"] span'));
        assert.equal(img.attr('src'), testUser.picture);
        assert.equal(name.text(), testUser.name);
        done();
      });
    });

    it('should bring user back to homepage on logo click', function(done) {
      httpBackend.expectGET('/auth/me').respond(testUser);

      scope.$on('headerCtrl', function() {
        httpBackend.flush();
        var logo = element.find('a.logo, .logo a').eq(0);
        assert.isOk(logo);
        assert.equal(logo.attr('href'), '/');
        done();
      });
    });

    it('can log user out with logout button', function(done) {
      httpBackend.expectGET('/auth/me').respond(testUser);

      scope.$on('headerCtrl', function() {
        httpBackend.flush();
        var logout = element.find('a:contains("Logout")').eq(0);
        assert.isOk(logout);
        assert.equal(logout.closest('.ng-hide').length, 0);
        httpBackend.expectGET(/\/auth\/logout/i).respond({});
        httpBackend.expectGET(/\/auth\/me/i).respond(401);
        logout.trigger('click');
        httpBackend.flush();
        assert.notEqual(logout.closest('.ng-hide').length, 0);
        done();
      });
    });

    it('can log user in with facebook/twitter/github', function(done) {
      httpBackend.expectGET('/auth/me').respond(401);

      scope.$on('headerCtrl', function() {
        httpBackend.flush();
        var links = element.find('.login-link');
        var facebook = element.find('.facebook-login');
        var twitter = element.find('.twitter-login');
        var github = element.find('.github-login');
        assert.equal(links.length, 3);
        assert.equal(facebook.attr('href'), '/auth/facebook' );
        assert.equal(twitter.attr('href'), '/auth/twitter' );
        assert.equal(github.attr('href'), '/auth/github' );
        assert.equal(facebook.closest('.ng-hide').length, 0 );
        assert.equal(twitter.closest('.ng-hide').length, 0 );
        assert.equal(github.closest('.ng-hide').length, 0 );
        assert.notEqual(
          element.find('label[for="user-nav-state"]').closest('.ng-hide'),
          0 );
        done();
      });
    });

    it('allows users to natvigate to different pages', function(done) {
      httpBackend.expectGET('/auth/me').respond(testUser);
      
      scope.$on('headerCtrl', function() {
        httpBackend.flush();
        var createBtn = element.find('a:contains("Create")');
        var myPollsBtn = element.find('a:contains("My")');
        assert.equal(createBtn.attr('href'),'/create_poll');
        assert.equal(createBtn.closest('.ng-hide').length, 0);
        assert.equal(myPollsBtn.attr('href'), '/my_polls');
        assert.equal(myPollsBtn.closest('.ng-hide').length, 0);
        done();
      });
    });
  });

  describe('voteHome', function() {
    beforeEach(function() {
      element = compile('<vote-home></vote-home>')(scope);
      scope.$apply();
    });

    beforeEach(function() {
      httpBackend.
      expectGET('/api/list?offset=0&hot=1').
      respond(testPolls.slice().reverse().slice(0, 50));

      httpBackend.
      expectGET('/api/list?offset=0').
      respond(testPolls.slice(0, 50));
    });

    it('loads an initial list of polls sorted by date', function(done) {
      scope.$on('homeCtrl', function() {
        httpBackend.flush();
        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 50);
        for(let i = 0; i < rows.length; i++) {
          assert.equal(rows.eq(i).find('td').eq(0).text(),
            testPolls[i].title);
        }
        done();
      });
    });

    it('can switch to a list sorted by votes', function(done) {
      scope.$on('homeCtrl', function() {
        httpBackend.flush();
        var btn = element.find('.tab-control:contains("Hot")');
        assert.equal(btn.length, 1);
        btn.trigger('click');
        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 50);
        for(let i = 0; i < rows.length; i++) {
          assert.equal(rows.eq(i).find('td').eq(0).text(),
            testPolls[testPolls.length - 1 - i].title);
        }
        done();
      });
    });

    it('can load more hot/new polls without duplicating', function(done) {
      scope.$on('homeCtrl', function() {
        httpBackend.flush();
        var loadBtns = element.find(
          'vote-poll-list button:contains("More")');
        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 50);
        httpBackend.expectGET('/api/list?offset=50').respond(
          testPolls.slice(30, 80));
        loadBtns.eq(0).trigger('click');
        httpBackend.flush();
        rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 80);
        for(let i = 0; i < rows.length; i++) {
          assert.equal(rows.eq(i).find('td').eq(0).text(),
            testPolls[i].title);
        }

        var hotBtn = element.find('.tab-control:contains("Hot")');
        hotBtn.trigger('click');
        rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 50);

        httpBackend.expectGET('/api/list?offset=50&hot=1').respond(
          testPolls.slice().reverse().slice(30, 80));
        loadBtns.eq(1).trigger('click');
        httpBackend.flush();
        rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 80);
        for(let i = 0; i < rows.length; i++) {
          assert.equal(rows.eq(i).find('td').eq(0).text(),
            testPolls[testPolls.length - 1 - i].title);
        }

        done();
      });
    });

    it('show total number polls after loading all polls', function(done) {
      scope.$on('homeCtrl', function() {
        httpBackend.flush();
        var loadBtn = 
          element.find('vote-poll-list button:contains("More")').eq(0);
        httpBackend.expectGET('/api/list?offset=50').respond([]);
        assert.equal(
          visible(element.find('h5:contains("Loading")')).length, 0);
        loadBtn.trigger('click');
        assert.equal(
          visible(element.find('h5:contains("Loading")')).length, 1);
        httpBackend.flush();

        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 50);
        var total = visible(element.find('h5:contains("total")'));
        assert.equal( total.length, 1 );
        assert.isOk(~total.text().indexOf( rows.length.toString() ));
        done();
      });
    });
  });

  describe('voteMyPolls', function() {
    beforeEach(function() {
      element = compile('<vote-my-polls></vote-my-polls>')(scope);
      scope.$apply();
    });

    beforeEach(function() {
      httpBackend.expectGET('/api/ownlist?offset=0').respond(
        testPolls.slice(42, 43));
    });

    it('loads a list of own polls intially', function(done) {
      scope.$on('myPollsCtrl', function() {
        httpBackend.flush();
        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 1);
        assert.equal(rows.find('td').eq(0).text(), testPolls[42].title);
        done();
      });
    });

    it('allows user to search his/her own polls', function(done) {
      scope.$on('myPollsCtrl', function() {
        httpBackend.flush();
        var input = element.find('input[type="text"]');
        assert.equal(input.length, 1);
        const query = 'some query';
        input.val(query).trigger('input');

        httpBackend.expectGET('/api/ownsearch/' + encodeURIComponent(query) 
          + '?offset=0').

        respond([]);
        element.find('.search').trigger('submit');
        httpBackend.flush();
        done();
      });
    });

    it('allows user to delete polls', function(done) {
      scope.$on('myPollsCtrl', function() {
        httpBackend.flush();
        var delBtn = element.find('button:contains("Delete")');
        assert.equal(delBtn.length, 1);
        httpBackend.expectDELETE('/api/delete_poll/42').respond(200);
        delBtn.trigger('click');
        httpBackend.flush();
        done();
      });
    });
  });

  describe('voteSearch', function() {
    var query = 'myquery';

    beforeEach(function() {
      injector.invoke(function($routeParams) {
        angular.extend($routeParams, {query});
        element = compile('<vote-search></vote-search>')(scope);
        scope.$digest();

        httpBackend.expectGET(`/api/search/${query}?offset=0`)
        .respond(testPolls.slice(0, 10));
      });
    });

    it('searches with the query string in the URL', function(done) {
      scope.$on('searchCtrl', function() {
        httpBackend.flush();
        var rows = visible(element.find('tbody tr'));
        assert.equal(rows.length, 10);
        done();
      });
    });
  });

  describe('voteCreate', function() {
    let userAuth;

    beforeEach(function() {
      element = compile('<vote-create></vote-create>')(scope);
      scope.$digest();
      userAuth = httpBackend.expectGET('/auth/me').respond(testUser);
    });

    it('can create a new poll', function(done) {
      scope.$on('createCtrl', function() {
        httpBackend.flush();
        var form = element.find('.form-create-poll');
        var title = element.find('#create-title');
        var op1 = element.find('#create-option-0');
        var op2 = element.find('#create-option-1');
        assert.equal(form.length, 1);
        assert.equal(title.length, 1);
        assert.equal(op1.length, 1);
        assert.equal(op2.length, 1);
        httpBackend.expectPOST('/api/create_poll').respond({pollID: 1});
        title.val('My Title').trigger('input');
        op1.val('My Option 1').trigger('input');
        op2.val('My Option 2').trigger('input');
        form.trigger('submit');
        httpBackend.flush();
        done();
      });
    });

    it('can add more options to the new polls', function(done) {
      scope.$on('createCtrl', function() {
        httpBackend.flush();
        var more = element.find('button:contains("More")');
        assert.equal(more.length, 1);
        more.trigger('click');
        
        var pluses = element.find('button:contains("\u002b")');
        assert.equal(pluses.length, 3);
        pluses.eq(0).trigger('click');
        pluses.eq(1).trigger('click');
        pluses.eq(2).trigger('click');

        var options = [];
        for(let i = 0; i < 6; i++) {
          options[i] = element.find(`#create-option-${i}`);
          assert.equal(options[i].length, 1);
          options[i].val(`option ${i}`).trigger('input');
        }
        var title = element.find('#create-title');
        assert.equal(title.length, 1);
        title.val('title').trigger('input');
        httpBackend.expectPOST('/api/create_poll', function(data) {
          data = JSON.parse(data);
          return data.title && Array.isArray(data.options) &&
                  (data.options.length === 6);
        }).respond({pollID: 123});

        element.find('form').trigger('submit');
        httpBackend.flush();

        done();
      });
    });

    it('can delete some options', function(done) {
      scope.$on('createCtrl', function() {
        httpBackend.flush();
        var more = element.find('button:contains("More")');
        assert.equal(more.length, 1);
        more.trigger('click');
        more.trigger('click');
        more.trigger('click');
        more.trigger('click');
        more.trigger('click');

        var times = element.find('button:contains("\u00d7")');
        assert.equal(times.length, 7);

        var options = [];
        for(let i = 0; i < 7; i++) {
          options[i] = element.find(`#create-option-${i>4?i-1:i}`);
          assert.equal(options[i].length, 1);
          options[i].val(`option ${i}`).trigger('input');
          if(i == 4) {
            times.eq(4).trigger('click');
          }
        }
        var title = element.find('#create-title');
        assert.equal(title.length, 1);
        title.val('title').trigger('input');
        httpBackend.expectPOST('/api/create_poll', function(data) {
          data = JSON.parse(data);
          if(!data.title) return false;
          if(!Array.isArray(data.options)) return false;
          if(data.options.length !== 6) return false;
          for(let i = 0; i < 6; i++) {
            if(i < 4 && data.options[i].option !== `option ${i}`) {
              return false;
            }
            if(i >= 4 && data.options[i].option !== `option ${i+1}`) {
              return false;
            }
          }
          return true;
        }).respond({pollID: 123});

        element.find('form').trigger('submit');
        httpBackend.flush();

        done();
      });
    });

    it('rejects invalid inputs', function(done) {
      var sent = false;

      scope.$on('createCtrl', function() {
        httpBackend.flush();
        httpBackend.whenPOST('/api/create_poll', function(data) {
          sent = true;
        }).respond(400, '');

        let options = [];
        for(let i = 0; i < 2; i++) {
          let opt = element.find(`#create-option-${i}`);
          assert.equal(opt.length, 1);
          opt.val(`op${i}`).trigger('input');
          options.push(opt);
        }

        var title = element.find('#create-title');
        assert.equal(title.length, 1);
        var form = element.find('form');
        assert.equal(form.length, 1);

        //missing title
        form.trigger('submit');
        assert.isOk(!sent);

        //duplicate options
        title.val('a'.repeat(256)).trigger('input');
        options[0].val(options[1].val()).trigger('input');
        form.trigger('submit');
        assert.isOk(!sent);

        //missing option
        options = [];
        for(let i = 0; i < 2; i++) {
          options[i] = element.find(`#create-option-${i}`);
        }
        options[0].val('  ').trigger('input');
        options[1].val('abc').trigger('input');
        form.trigger('submit');
        assert.isOk(!sent);

        done();
      });
    });

    it('disallow unauthenticated user to create poll', function(done) {
      scope.$on('createCtrl', function() {
        userAuth.respond(401, '');
        let sent = false;
        httpBackend.flush();
        httpBackend.whenPOST('/api/create_poll', function(d) {
          sent = true;
        }).respond(400, '');

        element.find('#create-title').val('title').trigger('input');
        element.find('#create-option-0').val('op1').trigger('input');
        element.find('#create-option-1').val('op2').trigger('input');
        element.find('form').trigger('submit');
        assert.isOk(!sent);
        done();
      });
    });
  });

  describe('votePoll', function() {
    let testData = {
      _id: 123,
      title: 'some title',
      options: [{
        option: 'op1',
        votes: 0
      }, {
        option: 'op2',
        votes: 1
      }],
      count: 1,
      creator: 456,
      voters: [689]
    };
    let userAuth, pollFetch;
    beforeEach(function() {
      injector.invoke(function($routeParams) {
        $routeParams.id = 123;
        element = compile('<vote-poll></vote-poll>')(scope);
        scope.$digest();

        userAuth = httpBackend.expectGET('/auth/me').respond(testUser);
        pollFetch = httpBackend.expectGET('/api/poll/123').respond(testData);
      });
    });

    it('fetch poll data from server', function(done) {
      scope.$on('pollCtrl', function() {
        httpBackend.flush();
        let title = element.find(`h2:contains("${testData.title}")`);
        assert.equal(title.length, 1);

        for(let option of testData.options) {
          let row = element.find(`tr:contains("${option.option}")`);
          assert.equal(row.length, 1);
          let count = row.find('td').eq(1);
          assert.equal(count.text(), option.votes);
        }
        done();
      });
    });

    it('let user vote', function(done) {
      scope.$on('pollCtrl', function() {
        httpBackend.flush();
        httpBackend.expectPUT('/api/vote', function(data) {
          data = JSON.parse(data);
          return data.pollID == testData._id && data.optNum == 0;
        }).respond(200, '');
        element.find('tbody tr').eq(0).trigger('click');
        httpBackend.flush();
        done();
      });
    });

    it('does not allow user to vote twice', function(done) {
      scope.$on('pollCtrl', function() {
        let sent = false;
        pollFetch.respond(Object.assign({}, testData, {
          voters: [testUser._id]}));
        httpBackend.flush();
        httpBackend.whenPUT('/api/vote', function(d) {
          sent = true;
        }).respond(400, '');

        element.find('tbody tr').eq(0).trigger('click');
        assert.isOk(!sent);
        done();
      });
    });


    it('does not allow unauthenticated user to vote', function(done) {
      scope.$on('pollCtrl', function() {
        let sent = false;
        userAuth.respond(401, '');
        httpBackend.flush();
        httpBackend.whenPUT('/api/vote', function(d) {
          sent = true;
        }).respond(400, '');

        element.find('tbody tr').eq(0).trigger('click');
        assert.isOk(!sent);
        done();
      });
    });
  });
});

function visible(elements) {
  return elements.filter(function() {
    return $(this).closest('.ng-hide').length === 0;
  });
}
