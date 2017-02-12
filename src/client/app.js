'use strict';
(function() {
  google.charts.load('current', {'packages':['corechart']});

  const app = angular.module('voting', ['ng', 'ngRoute']);
  const controllers = require('./controllers');
  const directives = require('./directives');
  const services = require('./services');

  for(let ctrl in controllers) {
    if(controllers.hasOwnProperty(ctrl)) {
      app.controller(ctrl, controllers[ctrl]);
    }
  }

  for(let dir in directives) {
    if(directives.hasOwnProperty(dir)) {
      app.directive(dir, directives[dir]);
    }
  }

  for(let ser in services) {
    if(services.hasOwnProperty(ser)) {
      app.factory(ser, services[ser]);
    }
  }

  app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $locationProvider.
      html5Mode(true).
      hashPrefix('');

      $routeProvider.
      when('/', {
        template: '<vote-home></vote-home>'
      }).
      when('/my_polls', {
        template: '<vote-my-polls></vote-my-polls>'
      }).
      when('/create_poll', {
        template: '<vote-create></vote-create>'
      }).
      when('/search/:query', {
        template: '<vote-search></vote-search>'
      }).
      when('/poll/:id', {
        template: '<vote-poll></vote-poll>'
      }).
      when('/error/:status', {
        template: '<vote-error></vote-error>'
      }).
      when('/_=_', { //facebook login on homepage return to this route
        redirectTo: '/'
      }).
      otherwise({
        redirectTo: '/error/404'
      });
    }
  ]);

})();
