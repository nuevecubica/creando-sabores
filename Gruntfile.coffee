"use strict()"
config =
  port: 3000
  publicUrl: "http://0.0.0.0:3000"

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

paths.js.all = paths.js.server.concat paths.js.client

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
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

      all: [
        "Gruntfile.coffee"
        "utils/**/*.coffee"
        "test/**/*.coffee"
      ]
      test: ["test/**/*.coffee"]

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
        tasks: ["jshint:client", "jsbeautifier:client"]

      config:
        files: paths.js.config
        tasks: ["clean", "copy"]

      coffee:
        files: [
          "**/*.coffee"
        ]
        tasks: ["coffeelint:all"]

      less:
        files: [
          "frontend/styles/*.less"
          "frontend/styles/**/*.less"
        ]
        tasks: [
          "less:build"
          "autoprefixer:build"
          "cssmin:build"
        ]

    clean:
      build:
        src: [
          "public/fonts/basic*"
          "public/fonts/icons.*"
          "public/js/*"
          "config.js"
          "config-test.js"
          ".env"
        ]

    less:
      build:
        options:
          paths: ["public"]

        files:
          "public/styles/site.css": "frontend/styles/site.less"

    autoprefixer:
      build:
        options: {}
        src: "public/styles/site.css"

    cssmin:
      build:
        files:
          "public/styles/site.min.css": [
            "public/styles/site.css"
          ]

        options:
          keepSpecialComments: 0
          banner: "/* Chefcito CSS */"

    mochaTest:
      development:
        options:
          reporter: "spec"

        src: ["test/**/*.coffee"]

    jsbeautifier:
      options:
        config: '.jsbeautifyrc'
      server:
        src: paths.js.server

      client:
        src: paths.js.client

      build:
        src: paths.js.all


  grunt.config 'copy',
    build:
      files: [
        {
          expand: true
          cwd: "frontend/packages/semantic-ui/build/less/fonts/"
          src: ["**"]
          dest: "public/fonts/"
          filter: "isFile"
        }
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
          src: [
            "jquery/dist/jquery.min.js"
            "jquery/dist/jquery.min.map"
            "jquery-address/src/jquery.address.js"
            "semantic-ui/build/packaged/javascript/semantic.js"
            "handlebars/handlebars.min.js"
          ]
          dest: "public/js/libs"
        }
      ]

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

  # load linters
  grunt.registerTask "lint", (target) ->
    grunt.task.run ["jshint:server"]
    grunt.task.run ["jshint:client"]
    grunt.task.run ["coffeelint:all"]

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

  grunt.registerTask "test", ->
    grunt.task.run ["env:test", "lint", "mochaTest:development"]

  grunt.registerTask "default", ->
    grunt.task.run [grunt.config("environment")]

  grunt.registerTask "build", ->
    console.log("------------------------->>> " + process.env.NODE_ENV)
    console.log("------------------------->>> " + grunt.config("environment"))
    grunt.task.run [grunt.config("environment")]
