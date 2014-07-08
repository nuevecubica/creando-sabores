"use strict()"
config =
  port: 3000
  portTest: 7357

paths =
  js:
    server: [
      "./*.js"
      "configs/**/*.js"
      "middlewares/**/*.js"
      "routes/**/*.js"
      "models/**/*.js"
      "updates/**/*.js"
      "utils/**/*.js"
      "test/**/*.js"
    ]
    client: [
      "public/frontend/js/**/*.js"
    ]

paths.js.all = paths.js.server.concat paths.js.client

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    env: (
      grunt.option("env") or
      process.env.GRUNT_ENV or
      process.env.NODE_ENV or
      "preproduction"
    )

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
        "./*.coffee"
        "utils/**/*.coffee"
        "test/**/*.coffee"
      ]
      test: ["test/**/*.coffee"]

    concurrent:
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
            port: config.port
      server:
        script: "app.js"
        options:
          env:
            port: config.port
      test:
        script: "app-test.js"
        options:
          env:
            test: true

    watch:
      server:
        files: paths.js.server
        tasks: ["jshint:server", "jsbeautifier:server"]

      client:
        files: paths.js.client
        tasks: ["jshint:client", "jsbeautifier:client"]

      coffee:
        files: [
          "**/*.coffee"
        ]
        tasks: ["coffeelint:all"]

      less:
        files: [
          "public/frontend/styles/*.less"
          "public/frontend/styles/**/*.less"
        ]
        tasks: [
          "less:build"
          "autoprefixer:build"
          "cssmin:build"
        ]

    clean:
      build:
        src: [
          "public/frontend/fonts/basic*"
          "public/frontend/fonts/icons.*"
          "config.js"
          "config-test.js"
          ".env"
        ]

    less:
      build:
        options:
          paths: ["public"]

        files:
          "public/frontend/styles/site.css": "public/frontend/styles/site.less"

    autoprefixer:
      build:
        options: {}
        src: "public/frontend/styles/site.css"

    cssmin:
      build:
        files:
          "public/frontend/styles/site.min.css": [
            "public/frontend/styles/site.css"
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
          cwd: "public/packages/semantic-ui/build/less/fonts/"
          src: ["**"]
          dest: "public/frontend/fonts/"
          filter: "isFile"
        }
        {
          src: ["configs/config-" + grunt.config("env") + ".js"]
          dest: "config.js"
          filter: "isFile"
        }
        {
          src: ["configs/config-" + grunt.config("env") + "-test.js"]
          dest: "config-test.js"
          filter: "isFile"
        }
        {
          src: ["configs/" + grunt.config("env") + ".env"]
          dest: ".env"
          filter: "isFile"
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
    grunt.task.run ["lint", "mochaTest:development"]

  grunt.registerTask "default", ->
    grunt.task.run [grunt.config("env")]

  grunt.registerTask "build", ->
    console.log("--------------------------------->>> " + process.env.NODE_ENV)
    console.log("--------------------------------->>> " + grunt.config("env"))
    grunt.task.run [grunt.config("env")]

  grunt.registerTask "env", ->
    console.log process.env.NODE_ENV
    console.log grunt.config "env"
