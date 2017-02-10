'use strict';

exports.headerCtrl = ['$user', '$scope', '$http', '$location', '$flash',
  function($user, $scope, $http, $location, $flash) {
    $scope.user = $user;

    $scope.logout = function() {
      $http
      .get('/auth/logout')
      .then(function() {
        $location.path('/');
        return $user.loadUser();
      })
      .catch(function(err) {
        console.log(err);
      });
    };

    $scope.search = function() {
      if(!$scope.query) {
        $flash.setMsg('Enter a query to search', 'info');
        return;
      }
      $location.path(`/search/${$scope.query}`);
    };

  }
];

exports.homeCtrl = ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    var offset = 0;
    $scope.polls = [];
    $scope.done = false;
    $scope.pend = false;

    $scope.loadPolls = function() {
      $scope.pend = true;
      $http.
      get(`/api/list?offset=${offset}`).
      then(function(res) {
        $scope.pend = false;
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
          if(res.data.length === 0) {
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

    $scope.loadPolls();

  }
];

exports.myPollsCtrl = ['$scope', '$http', '$location', '$route',
  function($scope, $http, $location, $route) {
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
            $scope.done = true;
          }
        }
      }, function(res) {
        if($scope.polls.length === 0) {
          $location.path(`/error/${res.status}`);
        }
      });
    };

    $scope.loadMyPolls();

    $scope.delete = function(id) {
      $http.
      delete(`/api/delete_poll/${id}`).
      then(function(res) {
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
      get(`/api/ownsearch/${$scope.query}?offset=${searchOffset}`).
      then(function(res) {
        $scope.pend = false;
        $scope.polls = $scope.polls.concat(res.data);
        searchOffset = $scope.polls.length;
        if(!res.data.length) {
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
  }
];

exports.searchCtrl = ['$scope', '$http', '$routeParams', '$location',
  function($scope, $http, $routeParams, $location) {
    $scope.query = $routeParams.query;
    $scope.done = false;
    $scope.pend = false;
    $scope.polls = [];
    var offset = 0;

    $scope.search = function() {
      $scope.pend = true;

      $http
      .get(`/api/search/${$scope.query}?offset=${offset}`)
      .then(function(res) {
        $scope.pend = false;
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
          if(res.data.length === 0) {
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
  }
];

exports.createCtrl = ['$scope', '$http', '$location', '$flash',
  function($scope, $http, $location, $flash) {
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
    
    $scope.create = function() {
      if(!validate()) return;

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
      if($scope.options.length > 9) return;
      
      if(idx != void(0)) {
        $scope.options.splice(idx, 0, {option: ''});
      } else {
        $scope.options.push({option: ''});
      }
    };

    $scope.removeOption = function(idx, force = false) {
      if($scope.options.length < 3 && !force) return;
      $scope.options.splice(idx, 1);
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
          $scope.removeOption(i, true);
        }
      }

      // remove duplicate options
      var optVals = $scope.options.map( op => op.option );
      console.log(optVals);
      for(let i = optVals.length - 1; i >= 0; i--) {
        console.log(i);
        console.log(optVals.indexOf(optVals[i]));
        if(optVals.indexOf(optVals[i]) !== i) {
          $scope.removeOption(i, true);
        }
      }

      $scope.title = $scope.title.trim();

      var err = null;
      if($scope.title.length < minTitleLen) {
        err = 'Title is required';
      } else if($scope.title.length > maxTitleLen) {
        err = `Title is too long (max ${maxTitleLen} characters)`;
      } else if($scope.options.length > maxOptCnt) {
        err = `Too many options specified (max ${maxOptCnt})`;
      } else if($scope.options.length < minOptCnt) {
        err = `Too few options specified (min ${minOptCnt}). 
               Duplicates do not count.`;
      } else {
        for(let i = 0; i < $scope.options; i++) {
          if($scope.options[i].option.length < minOptLen) {
            err = `Option ${i + 1} is empty`;
            break;
          } else if($scope.options[i].option.length > maxOptLen) {
            err = `Option ${i + 1} is too long (max ${maxOptLen}
                   characters`;
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
        `Submitting your vote: ${$scope.poll.options[idx].option}`,
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
  }
];

exports.flashCtrl = ['$scope', '$flash',
  function($scope, $flash) {
    $scope.message = $flash.getMsg();
    $scope.close = $flash.clrMsg;
  }
];

