'use strict';

exports.voteHeader = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-header.html',
    controller: 'headerCtrl'
  };
};

exports.voteFooter = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-footer.html'
  };
};

exports.voteHome = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-home.html',
    controller: 'homeCtrl'
  };
};

exports.voteMyPolls = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-my-polls.html',
    controller: 'myPollsCtrl'
  };
};

exports.voteSearch = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-search.html',
    controller: 'searchCtrl'
  };
};

exports.voteCreate = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-create.html',
    controller: 'createCtrl'
  };
};

exports.votePoll = function() {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/templates/vote-poll.html',
    controller: 'pollCtrl'
  };
};

exports.votePollList = function() {
  return {
    restrict: 'E',
    scope: {
      polls: '=',
      more: '&',
      act: '=',
      delete: '&?',
      done: '='
    },
    templateUrl: '/templates/vote-poll-list.html'
  };
};

exports.voteFlash = function() {
  return {
    restrict: 'E',
    scope: {
    },
    templateUrl: '/templates/vote-flash.html',
    controller: 'flashCtrl'
  };
};
