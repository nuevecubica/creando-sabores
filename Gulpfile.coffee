###--------------------------------- GULP -----------------------------------###
gulp = require 'gulp'
env = process.env

# Dokku env fix
env.NODE_ENV = env.NODE_ENV or 'preproduction'

###------------------------------- LIBRARIES --------------------------------###

autoprefixer = require 'gulp-autoprefixer'
beautify = require 'gulp-jsbeautifier'
changed = require 'gulp-changed'
coffeelint = require 'gulp-coffeelint'
ignore = require 'gulp-ignore'
jshint = require 'gulp-jshint-cached'
less = require 'gulp-less'
minifycss = require 'gulp-minify-css'
nodemon = require 'gulp-nodemon'
rename = require 'gulp-rename'
rimraf = require 'gulp-rimraf'

mocha = if env.NODE_ENV is 'development' then require 'gulp-mocha' else ->

###-------------------------------- PATHS -----------------------------------###

paths = {
  scripts:
    server: [
      './*.js'
      'configs/**/*.js'
      'middlewares/**/*.js'
      'models/**/*.js'
      'routes/**/*.js'
      'test/**/*.js'
      ]
    client: [
      'public/frontend/js/**/*.js'
    ]
  coffee: [
    './*.coffee'
    'test/**/*.coffee'
    ]
  less: [
    'public/frontend/styles/*.less'
    'public/frontend/styles/**/*.less'
    ]
  site:
    less: 'public/frontend/styles/site.less'
    styles: 'public/frontend/styles/'

  clean: [
    'public/frontend/fonts/basic*'
    'public/frontend/fonts/icons.*'
    'config.js'
    'config-test.js'
    '.env'
    ]

  base: './'

  fonts:
    src: 'public/packages/semantic-ui/build/less/fonts/*'
    dest: 'public/frontend/fonts/'

  configs:
    config: 'configs/config-' + env.NODE_ENV + '.js'
    test: 'configs/config-' + env.NODE_ENV + '-test.js'
    env: 'configs/' + env.NODE_ENV + '.env'

  tests: ["test/**/*.coffee"]
}

###-------------------------------- CONFIGS ---------------------------------###

configs =
  beautify:
    config: '.jsbeautifyrc'
    mode: 'VERIFY_AND_WRITE'

  nodemon:
    script: 'app.js'
    ext: 'js'
    env:
      'NODE_ENV': 'development'
    nodeArgs: ['--debug']
    ignore: ['node_modules/**', 'public/packages/**', 'public/styles/**']

  lint:
    server:
      'devel': true
      'node': true
    client:
      'devel': true
      'browser': true
      'jquery': true

  less:
    output: 'site.min.css'

  minifycss:
    keepSpecialComments: 0
    banner: '/* Chefcito CSS */'

  mocha:
    reporter: "spec"

paths.scripts.all = paths.scripts.server.concat paths.scripts.client

###------------------------------ BASIC TASKS -------------------------------###

gulp.task 'beautify', ->
  gulp.src paths.scripts.all, paths.base
    .pipe changed paths.base
    .pipe beautify configs.beautify
    .pipe gulp.dest paths.base

gulp.task 'watch', ->
  gulp.watch paths.scripts.all, ['lint','beautify']
  gulp.watch paths.less, ['less']
  gulp.watch paths.coffee, ['lint']

gulp.task 'demon', ->
  nodemon configs.nodemon
    .on 'start', ['watch']
    .on 'change', ['watch']

gulp.task 'lint', ->
  gulp.src paths.scripts.server
    .pipe changed paths.base
    .pipe jshint configs.lint.server
    .pipe jshint.reporter 'jshint-stylish'
    .pipe jshint.reporter 'fail'

  gulp.src paths.scripts.client
    .pipe changed paths.base
    .pipe jshint configs.lint.client
    .pipe jshint.reporter 'jshint-stylish'
    .pipe jshint.reporter 'fail'

  gulp.src paths.coffee
    .pipe coffeelint()
    .pipe coffeelint.reporter 'default'
    .pipe coffeelint.reporter 'fail'

gulp.task 'less', ->
  gulp.src paths.site.less
    .pipe less()
    .pipe autoprefixer()
    .pipe minifycss configs.minifycss
    .pipe rename configs.less.output
    .pipe gulp.dest paths.site.styles

gulp.task 'clean', ->
  gulp.src paths.clean
    .pipe rimraf()

gulp.task 'copy', ->
  gulp.src paths.fonts.src
    .pipe gulp.dest paths.fonts.dest

  gulp.src paths.configs.config
    .pipe rename 'config.js'
    .pipe gulp.dest paths.base
  gulp.src paths.configs.test
    .pipe rename 'config-test.js'
    .pipe gulp.dest paths.base
  gulp.src paths.configs.env
    .pipe rename '.env'
    .pipe gulp.dest paths.base

gulp.task 'test', ->
  gulp.src paths.tests
    .pipe mocha configs.mocha

###--------------------------------- TASKS ----------------------------------###

gulp.task 'development', ['beautify', 'lint', 'clean', 'copy']
gulp.task 'preproduction', ['lint', 'clean', 'copy']
gulp.task 'production', ['lint', 'clean', 'copy']

gulp.task 'build', [env.NODE_ENV]

gulp.task 'default', ['build']