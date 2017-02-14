'use strict';

module.exports = function(config) {
  config.set({
    files: [
      'https://code.jquery.com/jquery-3.1.1.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-route.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular-filter/0.5.14/angular-filter.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-mocks.js',
      './google.js',
      './bin/app.js',
      './test.js',
      {pattern: './bin/templates/*.html', included: false, served: true}
    ],
    frameworks: ['mocha', 'chai'],
    port: 9876,
    browsers: ['Chrome'],
    proxies: {
      '/templates/': 'http://localhost:9876/base/bin/templates/'
    }
  });
};
