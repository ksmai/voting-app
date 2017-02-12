'use strict';

exports.$user = ['$http', '$flash',
  function($http, $flash) {
    var $user = {};
    var welcomed = false;

    $user.loadUser = function() {
      $http
      .get('/auth/me')
      .then(function(res) {
        $user.data = res.data;
        if(!welcomed) {
          welcomed = true;
          $flash.setMsg(`Welcome, ${res.data.name}!`, 'success');
        }
      }, function(err) {
        $user.data = null;
      });
    };

    $user.loadUser();

    setInterval($user.loadUser, 30 * 60 * 1000);

    return $user;
  }
];

exports.$flash = ['$timeout',
  function($timeout) {
    const message = {
      msg: '',
      type: 'success'
    };

    var timeout = 5 * 1000;
    var lastTimeout = null;

    return {
      getMsg() {
        return message;
      },
      setMsg(msg, type = 'success') {
        message.msg = msg;
        message.type = type;

        if(lastTimeout) {
          $timeout.cancel(lastTimeout);
        }
        lastTimeout = $timeout(function() {
          message.msg = '';
        }, timeout);

        return message;
      },
      clrMsg() {
        message.msg = '';
        if(lastTimeout) {
          $timeout.cancel(lastTimeout);
        }
        return message;
      },
      setTimeout(time = 10 * 1000) {
        timeout = parseInt(time) || timeout;
        return message;
      }
    };
  }
];
