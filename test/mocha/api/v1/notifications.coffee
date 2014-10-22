must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

describe 'API v1: /notifications', ->

  beforeEach (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'PUT /api/v1/notifications/:email/:token/subscribe/newsletter', ->
    email = 'dummy@ema.il'
    token = '000000000000'

    describe 'on request invalid email and token', ->
      it 'responds with not found', (done) ->
        request
        .put('/api/v1/notifications/' + email + '/' + token +
          '/subscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done)

    user = {
      email: 'testUser4@glue.gl',
      token: '0be1c8059d51b0051b288c8aef8297830dfcebb0'
    }

    describe 'on request valid user', ->
      it 'responds with success', (done) ->
        request
        .put('/api/v1/notifications/' + user.email + '/' +
          user.token + '/subscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.success.must.be.eql true
            res.body.error.must.be.eql false
        )
        .end  (err, res) ->
          request
          .get('/api/v1/notifications/get/newsletter/users')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              users = (u.email for u in res.body.users)
              users.must.include user.email
          )
          .end(done)

  describe 'PUT /api/v1/notifications/:email/:token/unsubscribe/newsletter', ->

    email = 'dummy@ema.il'
    token = '000000000000'

    describe 'on request invalid email and token', ->
      it 'responds with not found', (done) ->
        request
        .put('/api/v1/notifications/' + email + '/' + token +
          '/unsubscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done)

    user = {
      email: 'testUser4@glue.gl',
      token: '0be1c8059d51b0051b288c8aef8297830dfcebb0'
    }

    describe 'on request valid user', ->
      it 'responds with success', (done) ->
        request
        .put('/api/v1/notifications/' + user.email + '/' +
          user.token + '/unsubscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.success.must.be.eql true
            res.body.error.must.be.eql false
        )
        .end (err, res) ->
          request
          .get('/api/v1/notifications/get/newsletter/users')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              users = (u.email for u in res.body.users)
              users.must.not.include user.email
          )
          .end(done)