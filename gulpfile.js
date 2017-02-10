'use strict';
const gulp = require('gulp');
const mocha = require('gulp-mocha');
const minifyHTML = require('gulp-minify-html');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

gulp.task('test-server', function() {
  gulp
  .src(['./src/server/**/*.test.js'])
  .pipe(mocha());
});

gulp.task('minhtml', function() {
  gulp
  .src(['./src/client/**/*.html'])
  .pipe(minifyHTML({
    empty: true
  }))
  .pipe(gulp.dest('./bin'));
});

gulp.task('mincss', function() {
  gulp
  .src(['./src/client/**/base.css', './src/client/**/*.css'])
  .pipe(autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(cleanCSS())
  .pipe(concat('styles.css'))
  .pipe(gulp.dest('./bin'))
});

gulp.task('browserify', function() {
  gulp
  .src('./src/client/app.js')
  .pipe(browserify())
  .pipe(babel({
    presets: ['es2015']
  }))
  .pipe(uglify())
  .pipe(gulp.dest('./bin'));
});

gulp.task('build', ['minhtml', 'mincss', 'browserify']);

gulp.task('watch', ['build'], function() {
  gulp.watch(['./src/client/**/*.html'], ['minhtml']);
  gulp.watch(['./src/client/**/*.css'], ['mincss']);
  gulp.watch(['./src/client/**/*.js'], ['browserify']);
  console.log(`Watching with PID ${process.pid}`);
});
