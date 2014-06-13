must = require("must")
request = require("supertest")

config = require(__dirname + "/../../../config-development-test.js")

request = request(config.url)

describe 'API v1: /user', ->
  # before (done) ->
  #   this.timeout 10000
  #   keystone = require __dirname + '/../../../keystone-test.js'
  #   keystone.testStart ->
  #     Users = keystone.list 'User'
  #     for user in config.lists.users
  #       userM = new Users.model()
  #       userM.name     = user.name
  #       userM.username = user.username
  #       userM.email    = user.email
  #       userM.password = user.password
  #       userM.save()
  #     done()

  describe "GET /user/:username/check", ->
    describe "Request valid user", ->
      it "respond with success", (done) ->
        request
        .get("/api/v1/user/testUser1/check")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/).expect 200, done
