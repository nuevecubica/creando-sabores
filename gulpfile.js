var gulp = require('gulp');
var beautify = require('gulp-jsbeautifier');
var jshint = require('gulp-jshint');

var paths = {
  scripts: ['*.js', 'middlewares/**/*.js', 'configs/**/*.js', 'models/**/*.js', 'public/frontend/js/**/*.js', 'routes/**/*.js', 'test/**/*.js']
};

gulp.task('scripts', function() {
  // Beautify all JavaScript (except vendor scripts)
  return gulp.src(paths.scripts, {
    base: './'
  }).pipe(beautify({
    config: '.jsbeautifyrc',
    mode: 'VERIFY_AND_WRITE'
  })).pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('lint', function() {
  return gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['watch', 'scripts']);
