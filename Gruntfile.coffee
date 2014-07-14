"use strict()"

## ======================== COMMON

config =
  port: 3000
  publicUrl: "http://0.0.0.0:3000"

## ======================== PATHS

paths =
  js:
    server: [
      "app.js"
      "app-test-init.js"
      "configs/**/*.js"
      "middlewares/**/*.js"
      "routes/**/*.js"
      "models/**/*.js"
      "updates/**/*.js"
      "utils/**/*.js"
      "test/**/*.js"
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
  coffee:
    all: [
      "Gruntfile.coffee"
      "utils/**/*.coffee"
      "test/**/*.coffee"
    ]
    test: ["test/**/*.coffee"]
  clean:
    client: [
      "public/fonts/basic*"
      "public/fonts/icons.*"
      "public/js/*"
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
        files:
          src: paths.js.server

      client:
        options:
          devel: true
          jquery: true
          browser: true
        files:
          src: paths.js.client

    coffeelint:
      # options:
      #   configFile: 'coffeelint.json'

      all: paths.coffee.all
      test: paths.coffee.test

    concurrent:
      default:
        tasks: [
          "nodemon:server"
          "watch"
        ]
        options:
          logConcurrentOutput: true

      development:
        tasks: [
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
          env:
            PORT: config.port
            APP_TEST: false
            APP_PUBLIC_URL: config.publicUrl

      server:
        script: "app.js"
        options:
          env:
            PORT: config.port
            APP_TEST: false
            APP_PUBLIC_URL: config.publicUrl

      test:
        script: "app.js"
        options:
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

      less:
        files: paths.less.src
        tasks: [
          "less:build"
          "autoprefixer:build"
          "cssmin:build"
        ]

    clean:
      client:
        src: paths.clean.client
      config:
        src: paths.clean.config

    less:
      build:
        options:
          paths: ["public"]

        files: {
          # configured later
        }

    autoprefixer:
      build:
        options: {}
        src: paths.css.normal

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

        src: paths.coffee.test

    jsbeautifier:
      options:
        config: '.jsbeautifyrc'
      server:
        src: paths.js.server

      client:
        src: paths.js.client

      build:
        src: paths.js.all


  initConfig.less.build.files[paths.css.normal] = paths.css.src
  initConfig.cssmin.build.files[paths.css.min] = [paths.css.normal]

  # Project configuration.
  grunt.initConfig initConfig

  grunt.config 'copy',
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

  # Time how long tasks take. Can help when optimizing build times
  require("time-grunt") grunt

## ======================== TASKS

  # load linters
  grunt.registerTask "lint", (target) ->
    grunt.task.run ["jshint:server"]
    grunt.task.run ["jshint:client"]
    grunt.task.run ["coffeelint:all"]

  grunt.registerTask "test", ->
    grunt.task.run ["env:test", "lint", "mochaTest:development"]

## ======================== ENVIRONMENTS

  grunt.registerTask "development", ->
    grunt.task.run ["lint"]
    grunt.task.run ["jsbeautifier:build"]
    grunt.task.run ["lint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy"]

  grunt.registerTask "preproduction", ->
    grunt.task.run ["lint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy"]

  grunt.registerTask "production", ->
    grunt.task.run ["jshint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy"]

  grunt.registerTask "default", ->
    grunt.task.run [grunt.config("environment")]

  grunt.registerTask "build", ->
    console.log("------------------------->>> " + process.env.NODE_ENV)
    console.log("------------------------->>> " + grunt.config("environment"))
    grunt.task.run [grunt.config("environment")]
