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
      done: '=',
      pend: '='
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

exports.voteChart = ['$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      scope: {
        opts: '='
      },
      templateUrl: '/templates/vote-chart.html',
      link: function(scope, element) {
        // Source: https://developers.google.com/chart/interactive/docs/quick_start
        google.charts.setOnLoadCallback(delayDrawChart);

        angular.element($window).bind('resize', delayDrawChart);

        function delayDrawChart() {
          return $timeout(drawChart, 0);
        }

        function drawChart() {
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'option');
          data.addColumn('number', 'votes');
          data.addRows(scope.opts.map( obj => [obj.option, obj.votes] ));
          var options = {
            is3D: true,
            legend: {
              position: 'none'
            },
            pieSliceText: 'label',
            backgroundColor: '#eee',
            chartArea: {
              'left': '3%',
              'top': '3%',
              'width': '94%',
              'height': '94%'
            },
            fontName: 'Lato'
          };
          var chart = new google.visualization.PieChart(element.find('figure')[0]);
          chart.draw(data, options);
        }
      }
    };
  }
];

exports.voteFocus = ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $timeout(function() {
          element[0].focus();
        }, 0);
      }
    };
  }
];

exports.voteError = [
  function() {
    return {
      restrict: 'E',
      templateUrl: '/templates/vote-error.html',
      scope: {},
      controller: 'errorCtrl'
    };
  }
];
