(function() {
  const DEBUG = process.env.NODE_ENV === 'debug';
  const Chalk = require('chalk');

  var gulp = require('gulp'),
    mocha = require('gulp-spawn-mocha'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    cssnano = require('gulp-cssnano'),
    concat = require('gulp-concat'),
    del = require('del'),
    autoprefix = require('gulp-autoprefixer'),
    nodemon = require('gulp-nodemon');

  gulp.task('unit', [], function() {
    var self = this;
    // gulp.src(['tests/**/*.spec.js'], { read: false })
    //   .pipe(mocha({
    //     "debugBrk": DEBUG,
    //     'r': "tests/setup.js",
    //     "R": 'spec', //|| 'nyan'
    //     "istanbul": true
    //   })).on("error", function(err) {
    //     self.emit('done');
    //   })
  });

  gulp.task('watch-js', function() {
    gulp.watch(["./*.js", "tests/**/*.spec.js"], ['unit']);
  });

  //Compiles scss files to css
  gulp.task('style', function() {
    del.sync('./public/css/main.css');

    gulp.src('**/*.scss', {
        cwd: './views'
      })
      .pipe(concat('main.scss'))
      .pipe(sass().on('error', function(err) {
        console.log("SASS ERROR: " + err.message);
      }))
      .pipe(cssnano())
      .pipe(autoprefix())
      .pipe(gulp.dest('./public/css'));
  });

  //Watch my scss files for changes
  gulp.task('watch-sass', function() {
    gulp.watch('**/*.scss', {
      cwd: "./views/"
    }, ['style']);
  });

  //Start the application/webserver
  gulp.task('start', function() {
    nodemon({
      script: 'index.js',
      ext: 'js ejs',
      env: { 'NODE_ENV': 'development' },
      ignore: ["coverage/*", "tests/*", "views/*"]
    });
  });

  gulp.task("default", ['watch-js', "unit", "style", "watch-sass", "start"]);
}());