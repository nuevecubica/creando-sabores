must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data.js'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

describe 'API v1: /user', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'GET /user/:username/check', ->
    describe 'on request invalid user', ->
      it 'responds with not found', (done) ->
        request
        .get('/api/v1/user/textDummyUserName/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 404, done

    describe 'on request valid user', ->
      it 'responds with success', (done) ->
        request
        .get('/api/v1/user/' + data.users[0].username + '/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 200, done
