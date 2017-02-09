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

  }
];

exports.homeCtrl = ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    var offset = 0;
    $scope.polls = [];

    $scope.loadPolls = function() {
      $http.
      get(`/api/list?offset=${offset}`).
      then(function(res) {
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
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
    var offset = 0;
    $scope.polls = [];

    $scope.loadMyPolls = function() {
      $http.
      get(`/api/ownlist?offset=${offset}`).
      then(function(res) {
        if(Array.isArray(res.data)) {
          $scope.polls = $scope.polls.concat(res.data);
          offset = $scope.polls.length;
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
          $scope.done = true;
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

exports.createCtrl = ['$scope', '$http', '$location',
  function($scope, $http, $location) {
    $scope.options = [{option: ''}, {option: ''}];
    
    $scope.create = function() {
      $http.
      post('/api/create_poll', {
        title: $scope.title,
        options: $scope.options
      }).
      then(function(res) {
        if(res.data.pollID) {
          $location.path(`/poll/${res.data.pollID}`);
        } else {
          $location.path('/');
        }
      }, function(res) {
        $location.path(`/error/${res.status}`);
      });
    };
  }
];

exports.pollCtrl = ['$scope', '$http', '$routeParams', '$location',
  function($scope, $http, $routeParams, $location) {
    $http.
    get(`/api/poll/${$routeParams.id}`).
    then(function(res) {
      $scope.poll = res.data;
    }, function(res) {
      $location.path(`/error/${res.status}`);
    });
  }
];
