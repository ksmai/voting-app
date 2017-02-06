'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test-server', function() {
  gulp
  .src(['./src/server/**/*.test.js'])
  .pipe(mocha());
});

gulp.task('watch', function() {
  gulp.watch(['./src/server/**/*.js'], ['test-server']);
  console.log(`Watching with PID ${process.pid}`);
});
