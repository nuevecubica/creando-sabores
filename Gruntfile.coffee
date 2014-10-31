"use strict()"

## ======================== COMMON

config =
  port: process.env.PORT || 3000
  publicUrl: "http://localhost:" + (process.env.PORT || 3000)

## ======================== PATHS

paths =
  js:
    server: [
      "app.js"
      "app-test-init.js"
      "configs/**/*.js"
      "middlewares/**/*.js"
      "models/**/*.js"
      "routes/**/*.js"
      "services/**/*.js"
      "test/**/*.js"
      "updates/**/*.js"
      "utils/**/*.js"
    ]
    config: [
      "configs/**/*.js"
    ]
    client: [
      "frontend/js/**/*.js"
    ]
  css:
    normal: "public/styles/site.css"
    min: "public/styles/site.min.css"
    src: "frontend/styles/site.less"
    map:
      file: "public/styles/site.css.map"
      base: "frontend/styles/"
      source: "public/styles/"
      sourceRoot: "/less/"
      root: "/less/"
      url: "/styles/site.css.map"
  coffee:
    grunt:["Gruntfile.coffee"]
    all: [
      "utils/**/*.coffee"
      "test/**/*.coffee"
    ]
    test: ["test/**/*.coffee"]
  clean:
    client: [
      "public/fonts/basic*"
      "public/fonts/icons.*"
      "public/js/*"
      "public/less"
      "public/styles/site.css.map"
      "public/frontend"
      "public/packages"
    ]
    config: [
      "config.js"
      "config-test.js"
      ".env"
    ]
  copy:
    bower:
      src: [
        "jquery/dist/jquery.min.js"
        "jquery/dist/jquery.min.map"
        "lodash/dist/lodash.min.js"
        "jquery-address/src/jquery.address.js"
        "semantic-ui/build/packaged/javascript/semantic.js"
        "handlebars/handlebars.min.js"
      ]
      dest: "public/js/libs"
  less:
    src: [
      "frontend/styles/*.less"
      "frontend/styles/**/*.less"
    ]

paths.js.all = paths.js.server.concat paths.js.client

## ======================== CONFIGS

module.exports = (grunt) ->

  initConfig =
    pkg: grunt.file.readJSON("package.json")
    environment: (
      grunt.option("env") or
      process.env.GRUNT_ENV or
      process.env.NODE_ENV or
      "preproduction"
    )
    env:
      test:
        APP_TEST: true

    jshint:
      options:
        reporter: require("jshint-stylish")
        curly: true
        eqeqeq: true
        forin: true
        immed: true
        latedef: true
        laxcomma: true
        newcap: true
        noarg: true
        smarttabs: true
        sub: true
        undef: true
        eqnull: true

      server:
        options:
          devel: true
          node: true
          predef: ['__base']
        files:
          src: paths.js.server

      client:
        options:
          devel: true
          jquery: true
          browser: true
          predef: ['_']
        files:
          src: paths.js.client

    coffeelint:
      options:
        max_line_length:
          level: 'warn'

      all: paths.coffee.all
      test: paths.coffee.test

    concurrent:
      default:
        tasks: [
          "envdebug"
          "nodemon:server"
          "watch"
        ]
        options:
          logConcurrentOutput: true

      development:
        tasks: [
          "envdebug"
          "nodemon:debug"
          "watch"
        ]
        options:
          logConcurrentOutput: true

      test:
        tasks: [
          "nodemon:test"
          "watch"
        ]
        options:
          logConcurrentOutput: true

    nodemon:
      debug:
        script: "app.js"
        options:
          nodeArgs: ["--debug"]
          ignore: ['node_modules/**']
          env:
            PORT: config.port
            APP_TEST: false
            APP_PUBLIC_URL: config.publicUrl

      server:
        script: "app.js"
        options:
          ignore: ['node_modules/**']
          env:
            PORT: config.port
            APP_PUBLIC_URL: config.publicUrl

      test:
        script: "app.js"
        options:
          ignore: ['node_modules/**']
          env:
            PORT: config.port
            APP_TEST: true
            APP_PUBLIC_URL: config.publicUrl

    watch:
      server:
        files: paths.js.server
        tasks: ["jshint:server", "jsbeautifier:server"]

      client:
        files: paths.js.client
        tasks: [
          "jshint:client"
          "jsbeautifier:client"
          "clean:client"
          "copy:client"
        ]

      config:
        files: paths.js.config
        tasks: ["clean:config", "copy:config"]

      coffee:
        files: paths.coffee.all
        tasks: ["coffeelint:all"]

      grunt:
        files: paths.coffee.grunt
        tasks: ["default"]

      less:
        files: paths.less.src
        tasks: [
          "less:development"
          "autoprefixer:development"
          "replace:development"
          "copy:development"
        ]

    clean:
      client:
        src: paths.clean.client
      config:
        src: paths.clean.config

    less:
      development:
        options:
          paths: ["public"]
          sourceMap: true
          sourceMapFilename: paths.css.map.file
          sourceMapURL: paths.css.map.url
          sourceMapBasepath: paths.css.map.base
          sourceMapRootpath: paths.css.map.root
        files: {
          # configured later
        }
      production:
        options:
          paths: ["public"]
          sourceMap: false
        files: {
          # configured later
        }

    autoprefixer:
      development:
        src: paths.css.normal
        dest: paths.css.normal
        options:
          map:
            prev: paths.css.map.source
            annotation: paths.css.map.url
            sourceContent: true
            sourceRoot: paths.css.map.sourceRoot
      production:
        src: paths.css.normal
        dest: paths.css.normal
        options:
          map: false

    cssmin:
      build:
        files: {
          #configured later
        }

        options:
          keepSpecialComments: 0
          banner: "/* Chefcito CSS */"

    mochaTest:
      development:
        options:
          reporter: "spec"
          timeout: 15000

        src: ['test/mocha/**/*.coffee']

    mocha_casperjs:
      development:
        options:
          timeout: 60000
          casperTimeout: 60000

        files:
          src: ['test/casper/**/*.coffee']

    jsbeautifier:
      options:
        config: '.jsbeautifyrc'
      server:
        src: paths.js.server

      client:
        src: paths.js.client

      build:
        src: paths.js.all

    # Fixes an error in the autoprefixer's generated map
    replace:
      development:
        src: [paths.css.map.file]
        overwrite: true
        replacements: [
          from: new RegExp "\"[^\"]+/public/styles/site.css\""
          to: "\"/styles/site.css\""
        ]

  initConfig.less.development.files[paths.css.normal] = paths.css.src
  initConfig.less.production.files[paths.css.normal] = paths.css.src
  initConfig.cssmin.build.files[paths.css.min] = [paths.css.normal]

  # Project configuration.
  grunt.initConfig initConfig

  grunt.config 'copy',
    development:
      files: [
        {
          expand: true
          src: ["frontend/packages/semantic-ui/build/less/**"]
          dest: "public/less/"
          filter: "isFile"
        }
      ]
    client:
      files: [
        {
          expand: true
          cwd: "frontend/packages/semantic-ui/build/less/fonts/"
          src: ["**"]
          dest: "public/fonts/"
          filter: "isFile"
        }
        {
          expand: true
          cwd: "frontend/js/"
          src: ["**"]
          dest: "public/js/"
          filter: "isFile"
        }
        {
          expand: true
          cwd: "frontend/styles/"
          src: ["**"]
          dest: "public/less/"
          filter: "isFile"
        }
        {
          expand: true
          flatten: true
          cwd: "frontend/packages/"
          src: paths.copy.bower.src
          dest: paths.copy.bower.dest
        }
      ]
    config:
      files: [
        {
          src: ["configs/config-" + grunt.config("environment") + ".js"]
          dest: "config.js"
          filter: "isFile"
        }
        {
          src: ["configs/" + grunt.config("environment") + ".env"]
          dest: ".env"
          filter: "isFile"
        }
      ]

## ======================== LOAD DEFAULTS

  grunt.loadNpmTasks "grunt-autoprefixer"
  grunt.loadNpmTasks "grunt-coffeelint"
  grunt.loadNpmTasks "grunt-concurrent"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-cssmin"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-less"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-env"
  grunt.loadNpmTasks "grunt-jsbeautifier"
  grunt.loadNpmTasks "grunt-nodemon"
  grunt.loadNpmTasks "grunt-mocha-test"
  grunt.loadNpmTasks "grunt-mocha-casperjs"
  grunt.loadNpmTasks "grunt-text-replace"

  # Time how long tasks take. Can help when optimizing build times
  require("time-grunt") grunt

## ======================== TASKS

  # load linters
  grunt.registerTask "lint", (target) ->
    grunt.task.run ["jshint:server"]
    grunt.task.run ["jshint:client"]
    grunt.task.run ["coffeelint:all"]

  grunt.registerTask "test:backend", ->
    grunt.task.run ["env:test", "lint", "mochaTest:development"]

  grunt.registerTask "test:frontend", ->
    grunt.task.run ["env:test", "lint", "mocha_casperjs:development"]

  grunt.registerTask "test", ->
    grunt.task.run ["env:test", "lint", "mochaTest:development",
                    "mocha_casperjs:development"]

  grunt.registerTask "envdebug", ->
    console.log("NODE_ENV -------------------->>> " + process.env.NODE_ENV)
    console.log("PORT ------------------------>>> " + process.env.PORT)

## ======================== ENVIRONMENTS

  grunt.registerTask "development", ->
    grunt.task.run ["lint"]
    grunt.task.run ["jsbeautifier:build"]
    grunt.task.run ["lint"]
    grunt.task.run ["clean"]
    grunt.task.run ["less:development"]
    grunt.task.run ["autoprefixer:development"]
    grunt.task.run ["replace:development"]
    # grunt.task.run ["cssmin:build"]
    grunt.task.run ["copy:development"]
    grunt.task.run ["copy:config"]
    grunt.task.run ["copy:client"]
    grunt.task.run ["envdebug"]

  grunt.registerTask "preproduction", ->
    grunt.task.run ["lint"]
    grunt.task.run ["clean"]
    grunt.task.run ["less:production"]
    grunt.task.run ["autoprefixer:production"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["copy:config"]
    grunt.task.run ["copy:client"]
    grunt.task.run ["envdebug"]

  grunt.registerTask "production", ->
    grunt.task.run ["clean"]
    grunt.task.run ["less:production"]
    grunt.task.run ["autoprefixer:production"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["copy:config"]
    grunt.task.run ["copy:client"]
    grunt.task.run ["envdebug"]

  grunt.registerTask "default", ->
    grunt.task.run [grunt.config("environment")]

  grunt.registerTask "build", ->
    grunt.task.run [grunt.config("environment")]

  grunt.registerTask "dev", ->
    grunt.task.run ["build"]
    grunt.task.run ["concurrent:test"]
