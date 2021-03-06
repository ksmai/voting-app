'use strict';

exports.headerCtrl = ['$user', '$scope', '$http', '$location', '$flash',
  function($user, $scope, $http, $location, $flash) {
    $scope.user = $user;

    $scope.logout = function() {
      var name;
      if($user.data) name = $user.data.name;
      $http
      .get('/auth/logout')
      .then(function() {
        if(name) $flash.setMsg(`Bye, ${name}!`, 'success');
        $location.path('/');
        return $user.loadUser();
      })
      .catch(function(err) {
        console.log(err);
      });
    };

    $scope.search = function() {
      if(!$scope.query) {
        $flash.setMsg('Enter a query to search.', 'info');
        return;
      }
      $location.path(`/search/${$scope.query}`);
    };

    setTimeout(function() {
      $scope.$emit('headerCtrl');
    }, 0);
  }
];

exports.homeCtrl = ['$scope', '$http', '$location', '$flash',
  function($scope, $http, $location, $flash) {
    $scope.new = {
      offset: 0,
      polls: [],
      done: false,
      pend: false
    };

    $scope.hot = {
      offset: 0,
      polls: [],
      done: false,
      pend: false
    };

    $scope.hotTab = false;

    $scope.loadPolls = function(hot = false) {
      var data = hot ? $scope.hot : $scope.new;
      if(data.pend) return;

      data.pend = true;
      $http.
      get(`/api/list?offset=${data.offset}` + (hot ? '&hot=1' : '')).
      then(function(res) {
        data.pend = false;
        if(Array.isArray(res.data)) {
          data.polls = data.polls.concat(res.data);
          data.offset = data.polls.length;
          if(res.data.length === 0) {
            $flash.setMsg('No more result available.', 'info');
            data.done = true;
          }
        }
      }, function(res) {
        data.pend = false;
        if(data.polls.length === 0) {
          $location.path(`/error/${res.status}`);
        }
      });
    };

    $scope.tab = function(hot) {
      $scope.hotTab = hot;
    };

    $scope.loadNew = function() {
      return $scope.loadPolls(false);
    };

    $scope.loadHot = function() {
      return $scope.loadPolls(true);
    };

    $scope.loadPolls(true);
    $scope.loadPolls(false);

    setTimeout(function() {
      $scope.$emit('homeCtrl');
    }, 0);
  }
];

exports.myPollsCtrl = ['$scope', '$http', '$location', '$route', '$flash',
  function($scope, $http, $location, $route, $flash) {
    var offset = 0, searchOffset = 0;
    $scope.polls = [];
    $scope.searching = false;
    $scope.done = false;
    $scope.pend = false;

    $scope.loadMyPolls = function() {
      $scope.pend = true;

      $http.
      get(`/api/ownlist?offset=${offset}`).
      then(function(res) {
        $scope.pend = false;
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
          if(res.data.length === 0) {
            $flash.setMsg('No more result available.', 'info');
            $scope.done = true;
          }
        }
      }, function(res) {
        $scope.pend = false;
        if($scope.polls.length === 0) {
          $location.path(`/error/${res.status}`);
        }
      });
    };

    $scope.loadMyPolls();

    $scope.delete = function(id, title) {
      $http.
      delete(`/api/delete_poll/${id}`).
      then(function(res) {
        $flash.setMsg(`"${title}" has been successfully deleted!`,
          'success');
        $route.reload();
      }, function(res) {
        $location.path(`/error/${res.status}`);
      });
    };

    $scope.search = function(newSearch = true) {
      if(!$scope.query) return $scope.empty();

      if(newSearch) {
        searchOffset = 0;
        $scope.polls = [];
        $scope.done = false;
      }
      $scope.searching = true;
      $scope.pend = true;
      offset = 0;
      $http.
      get(`/api/ownsearch/${encodeURIComponent($scope.query)}?offset=${searchOffset}`).
      then(function(res) {
        $scope.pend = false;
        $scope.polls = $scope.polls.concat(res.data);
        searchOffset = $scope.polls.length;
        if(!res.data.length) {
          $flash.setMsg('No more result available.', 'info');
          $scope.done = true;
        }
      }, function(res) {
        $scope.pend = false;
      });
    };

    $scope.empty = function() {
      $scope.searching = false;
      $scope.query = '';
      $scope.polls = [];
      offset = 0;
      $scope.done = false;
      $scope.loadMyPolls();
    };

    $scope.more = function() {
      return $scope.searching ? $scope.search(false) : $scope.loadMyPolls();
    };

    setTimeout(function() {
      $scope.$emit('myPollsCtrl');
    }, 0);
  }
];

exports.searchCtrl = ['$scope', '$http', '$routeParams', '$location',
  '$flash',
  function($scope, $http, $routeParams, $location, $flash) {
    $scope.query = $routeParams.query;
    $scope.done = false;
    $scope.pend = false;
    $scope.polls = [];
    var offset = 0;

    $scope.search = function() {
      $scope.pend = true;

      $http
      .get(`/api/search/${encodeURIComponent($scope.query)}?offset=${offset}`)
      .then(function(res) {
        $scope.pend = false;
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
          if(res.data.length === 0) {
            $flash.setMsg('No more result available.', 'info');
            $scope.done = true;
          }
        }
      }, function(res) {
        $scope.pend = false;
        if($scope.polls.length === 0) {
          $location.path(`/error/${res.status}`);
        }
      });
    };

    $scope.search();

    setTimeout(function() {
      $scope.$emit('searchCtrl');
    }, 0);
  }
];

exports.createCtrl = ['$scope', '$http', '$location', '$flash', '$user',
  function($scope, $http, $location, $flash, $user) {
    const maxTitleLen = 256,
          minTitleLen = 1,
          maxOptLen = 128,
          minOptLen = 1,
          maxOptCnt = 10,
          minOptCnt = 2;

    $scope.maxTitleLen = maxTitleLen;
    $scope.maxOptLen = maxOptLen;
    $scope.options = [{option: ''}, {option: ''}];
    $scope.title = '';
    $scope.pend = false;
    
    $scope.create = function() {
      if(!$user.data) {
        $flash.setMsg('Please login to continue.', 'warning');
        return;
      }
      
      if(!validate()) return;

      if($scope.pend) return;
      $scope.pend = true;

      $http.
      post('/api/create_poll', {
        title: $scope.title,
        options: $scope.options
      }).
      then(function(res) {
        if(res.data.pollID) {
          $flash.setMsg('Your poll has been successfully created!',
            'success');
          $location.path(`/poll/${res.data.pollID}`);
        } else {
          $location.path('/error/400');
        }
      }, function(res) {
        $location.path(`/error/${res.status}`);
      });
    };

    $scope.addOption = function(idx) {
      if($scope.options.length >= maxOptCnt) {
        $flash.setMsg(`At most ${maxOptCnt} options can be specified.`,
            'info');
        return;
      }
      
      if(idx != void(0)) {
        $scope.options.splice(idx, 0, {option: ''});
      } else {
        $scope.options.push({option: ''});
      }
    };

    $scope.removeOption = function(idx) {
      $scope.options.splice(idx, 1);
      while($scope.options.length < minOptCnt) {
        $flash.setMsg(`At least ${minOptCnt} options are needed.`,
           'info');
        $scope.addOption();
      }
    };

    $scope.up = function(idx) {
      if(idx == void(0) || idx < 1 || !$scope.options[idx]) return;
      [$scope.options[idx - 1], $scope.options[idx]] = [
        $scope.options[idx], $scope.options[idx - 1]];
    };

    $scope.down = function(idx) {
      if(idx == void(0) || idx > $scope.options.length - 2) return;
      $scope.up(idx + 1);
    };

    $scope.reset = function() {
      $scope.title = '';
      $scope.options = [{option: ''}, {option: ''}];
    };

    function validate() {
      // remove empty options
      for(let i = $scope.options.length - 1; i >= 0; i--) {
        $scope.options[i].option = $scope.options[i].option.trim();
        if($scope.options[i].option.length === 0) {
          $scope.removeOption(i);
        }
      }

      // remove duplicate options
      var optVals = $scope.options.map( op => op.option );
      for(let i = optVals.length - 1; i >= 0; i--) {
        if(optVals.indexOf(optVals[i]) !== i) {
          $scope.removeOption(i);
        }
      }

      $scope.title = $scope.title.trim();

      var err = null;
      if($scope.title.length < minTitleLen) {
        err = 'There must be a title.';
      } else if($scope.title.length > maxTitleLen) {
        err = `Title is too long (max ${maxTitleLen} characters).`;
      } else if($scope.options.length > maxOptCnt) {
        err = `Too many options specified (max ${maxOptCnt}).`;
      } else if($scope.options.length < minOptCnt) {
        err = `Too few options specified (min ${minOptCnt}). 
               Duplicates do not count.`;
      } else {
        for(let i = 0; i < $scope.options.length; i++) {
          if($scope.options[i].option.length < minOptLen) {
            err = `Option ${i + 1} is empty.`;
            break;
          } else if($scope.options[i].option.length > maxOptLen) {
            err = `Option ${i + 1} is too long (max ${maxOptLen}
                   characters.`;
            break;
          }
        }
      }

      if(err) {
        $flash.setMsg(err, 'warning');
        while($scope.options.length < minOptCnt) {
          $scope.addOption();
        }
        return false;
      }

      return true;
    }

    setTimeout(function() {
      $scope.$emit('createCtrl');
    }, 0);
  }
];

exports.pollCtrl = ['$scope', '$http', '$routeParams', '$location',
  '$route', '$user', '$flash',
  function($scope, $http, $routeParams, $location, $route, $user, $flash) {
    var pend = false;

    $http.
    get(`/api/poll/${$routeParams.id}`).
    then(function(res) {
      $scope.poll = res.data;
    }, function(res) {
      $location.path(`/error/${res.status}`);
    });

    $scope.vote = function(idx) {
      if(!$user.data) {
        $flash.setMsg('Please login to vote.', 'info');
        return;
      } else if(~$scope.poll.voters.indexOf($user.data._id)) {
        $flash.setMsg('You have already voted before.', 'warning');
        return;
      } else if(pend) {
        return;
      }

      $flash.setMsg(
        `Submitting your vote: ${$scope.poll.options[idx].option}.`,
        'info'
      );
      pend = true;

      $http.
      put('/api/vote', {
        pollID: $scope.poll._id,
        optNum: idx
      }).
      then(function(res) {
        $flash.setMsg('You have successfully voted!', 'success');
        $route.reload();
      }, function(res) {
        $location.path(`/error/${res.status}`);
      });
    };

    setTimeout(function() {
      $scope.$emit('pollCtrl');
    }, 0);
  }
];

exports.flashCtrl = ['$scope', '$flash',
  function($scope, $flash) {
    $scope.message = $flash.getMsg();
    $scope.close = $flash.clrMsg;

    setTimeout(function() {
      $scope.$emit('flashCtrl');
    }, 0);
  }
];

exports.errorCtrl = ['$scope', '$routeParams',
  function($scope, $routeParams) {
    const code = parseInt($routeParams.status);
    var text;
    if(code && (text = require('http-status')[code])) {
      $scope.status = { code, text };
    }
    else {
      $scope.status = {
        code: 0,
        text: 'Unknown'
      };
    }

    setTimeout(function() {
      $scope.$emit('errorCtrl');
    }, 0);
  }
];
