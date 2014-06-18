must = require 'must'
keystone = null
config = require __dirname + '/../../../config-test.js'

request = require('supertest') config.url

describe 'API v1: /me/', ->
  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, done

  #*---------- LOGIN ----------*
  describe 'POST /me/login', ->

    describe 'with no data', ->
      it 'responds with error', (done) ->
        request
        .post('/api/v1/me/login')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done)
        .expect (res) ->
          if !res.body.error or res.body.success
            return 'error'

    describe 'with invalid credentials', ->
      it 'responds with unsuccess', (done) ->
        request
        .post('/api/v1/me/login')
        .send({
          email: config.lists.users[0].email,
          password: 'garbage'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done)
        .expect (res) ->
          return 'error' if res.body.success or res.body.error

    describe 'with valid credentials', ->
      it 'responds with success', (done) ->
        request
        .post('/api/v1/me/login')
        .send({
          email: config.lists.users[0].email,
          password: config.lists.users[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, done)
        .expect (res) ->
          return 'error' if !res.body.success or res.body.error


  #*---------- LOGOUT ----------*
  describe 'GET /me/logout', ->
    describe 'on request to logout', ->
      it 'should destroy user session'


