must = require 'must'
keystone = null
config = require __dirname + '/../../../config-test.js'

request = require('supertest') config.url

describe 'API v1: /user', ->
  before (done) ->
    this.timeout 10000

    keystone = require __dirname + '/../../../app-test-init.js'

    Users = keystone.list 'User'
    for user in config.lists.users
      userM = new Users.model()
      userM.name     = user.name
      userM.username = user.username
      userM.email    = user.email
      userM.password = user.password
      userM.save()

    request.get('/').expect 200, done

  describe 'GET /user/:username/check', ->
    describe 'on request invalid user', ->
      it 'respond with not found', (done) ->
        request
        .get('/api/v1/user/testUserXXX/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 404, done

  describe 'GET /user/:username/check', ->
    describe 'on request valid user', ->
      it 'respond with success', (done) ->
        request
        .get('/api/v1/user/testUser1/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 200, done
