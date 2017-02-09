'use strict';

exports.$user = ['$http',
  function($http) {
    var $user = {};

    $user.loadUser = function() {
      $http
      .get('/auth/me')
      .then(function(res) {
        $user.data = res.data;
      }, function(err) {
        $user.data = null;
      });
    };

    $user.loadUser();

    setInterval($user.loadUser, 30 * 60 * 1000);

    return $user;
  }
];
