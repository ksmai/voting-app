'use strict';

exports.headerCtrl = ['$user', '$scope', '$http', '$location',
  function($user, $scope, $http, $location) {
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

    $scope.enter = function(evt) {
      if(evt.which === 13) {
        $location.path(`/search/${$scope.query}`);
      }
    };

  }
];

exports.homeCtrl = ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    var offset = 0;
    $scope.polls = [];
    $scope.done = false;

    $scope.loadPolls = function() {
      $http.
      get(`/api/list?offset=${offset}`).
      then(function(res) {
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

    $scope.loadPolls();

  }
];

exports.myPollsCtrl = ['$scope', '$http', '$location', '$route',
  function($scope, $http, $location, $route) {
    var offset = 0, searchOffset = 0;
    $scope.polls = [];
    $scope.searching = false;
    $scope.done = false;

    $scope.loadMyPolls = function() {
      $http.
      get(`/api/ownlist?offset=${offset}`).
      then(function(res) {
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
      offset = 0;
      $http.
      get(`/api/ownsearch/${$scope.query}?offset=${searchOffset}`).
      then(function(res) {
        $scope.polls = $scope.polls.concat(res.data);
        searchOffset = $scope.polls.length;
        if(!res.data.length) {
          $scope.done = true;
        }
      }, function(res) {
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
    $scope.polls = [];
    var offset = 0;

    $scope.search = function() {
      $http
      .get(`/api/search/${$scope.query}?offset=${offset}`)
      .then(function(res) {
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

    $scope.search();
  }
];

exports.createCtrl = ['$scope', '$http', '$location', '$flash',
  function($scope, $http, $location, $flash) {
    $scope.options = [{option: ''}, {option: ''}];
    
    $scope.create = function() {
      if(!verify()) return;

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

    $scope.addOption = function() {
      $scope.options.push({option: ''});
    };

    $scope.removeOption = function(idx) {
      $scope.options.splice(idx, 1);
    };

    function verify() {
      return true;
    }
  }
];

exports.pollCtrl = ['$scope', '$http', '$routeParams', '$location',
  '$route', '$user', '$flash',
  function($scope, $http, $routeParams, $location, $route, $user, $flash) {
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
      }

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
