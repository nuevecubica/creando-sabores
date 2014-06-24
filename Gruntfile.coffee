"use strict()"
config =
  port: 3000
  portTest: 7357

module.exports = (grunt) ->

  # Project configuration.
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    env: (
      grunt.option("env") or
      process.env.GRUNT_ENV or
      process.env.NODE_ENV or
      "development"
    )
    express:
      options:
        port: config.port

      development:
        options:
          script: "app.js"
          debug: true

    jshint:
      options:
        reporter: require("jshint-stylish")
        jshintrc: ".jshintrc"

      all: [
        "routes/**/*.js"
        "models/**/*.js"
        "public/frontend/js/**/*,js"
      ]
      server: ["./*.js"]

    coffeelint:
      # options:
      #   configFile: 'coffeelint.json'

      all: [
        "./*.coffee"
        "test/**/*.coffee"
      ]
      test: ["test/**/*.coffee"]

    concurrent:
      development:
        tasks: [
          "nodemon"
          "watch"
        ]
        options:
          logConcurrentOutput: true

    "node-inspector":
      custom:
        options:
          "web-host": "localhost"

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
      js:
        files: [
          "model/**/*.js"
          "routes/**/*.js"
        ]
        tasks: ["jshint:all"]

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
        options:
          livereload: false

      livereload:
        files: [
          "public/frontend/styles/**/*.css"
          "public/frontend/styles/**/*.less"
          "templates/**/*.jade"
          "node_modules/keystone/templates/**/*.jade"
        ]
        options:
          livereload: false

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
      build:
        src: [
          "*.js"
          "configs/**/*.js"
          "models/**/*.js"
          "routes/**/*.js"
          "updates/**/*.js"
          "public/frontend/**/*.js"
        ]
        options: {
          config: '.jsbeautifyrc'
        }

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
      ],
    development:
      files: [
        {
          src: ["configs/config-development.js"]
          dest: "config.js"
          filter: "isFile"
        }
        {
          src: ["configs/config-development-test.js"]
          dest: "config-test.js"
          filter: "isFile"
        }
        {
          src: ["configs/development.env"]
          dest: ".env"
          filter: "isFile"
        }
      ],
    preproduction:
      files: [
        {
          src: ["configs/config-preproduction.js"]
          dest: "config.js"
          filter: "isFile"
        }
        {
          src: ["configs/preproduction.env"]
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
  grunt.loadNpmTasks "grunt-express-server"
  grunt.loadNpmTasks "grunt-jsbeautifier"
  grunt.loadNpmTasks "grunt-node-inspector"
  grunt.loadNpmTasks "grunt-nodemon"
  grunt.loadNpmTasks "grunt-mocha-test"

  # Time how long tasks take. Can help when optimizing build times
  require("time-grunt") grunt

  # load linters
  grunt.registerTask "lint", (target) ->
    grunt.task.run ["jshint:all"]
    grunt.task.run ["coffeelint:all"]

  # default option to connect server
  grunt.registerTask "serve", (target) ->
    grunt.task.run [
      "lint"
      "concurrent:development"
    ]

  grunt.registerTask "development", ->
    grunt.task.run ["lint"]
    grunt.task.run ["jsbeautifier:build"]
    grunt.task.run ["lint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy:build"]
    grunt.task.run ["copy:development"]

  grunt.registerTask "preproduction", ->
    grunt.task.run ["lint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy:build"]
    grunt.task.run ["copy:preproduction"]

  grunt.registerTask "production", ->
    grunt.task.run ["jshint"]
    grunt.task.run ["less:build"]
    grunt.task.run ["autoprefixer:build"]
    grunt.task.run ["cssmin:build"]
    grunt.task.run ["clean"]
    grunt.task.run ["copy:build"]

  grunt.registerTask "test", ->
    grunt.task.run ["lint", "mochaTest:development"]

  grunt.registerTask "default", ->
    grunt.task.run [grunt.config("env")]

  grunt.registerTask "build", ->
    console.log("----------------------------------------->>> " + process.env.NODE_ENV)
    console.log("----------------------------------------->>> " + grunt.config("env"))
    grunt.task.run [grunt.config("env")]

  grunt.registerTask "env", ->
    console.log process.env.NODE_ENV
    console.log grunt.config "env"
