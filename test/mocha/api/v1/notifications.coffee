must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

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



    describe 'on request valid user', ->

      before (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.admins[0].email,
          password: data.admins[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      user = data.users[4]

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
          .set('cookie', cookie)
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

    before (done) ->
      request
      .post('/api/v1/login')
      .send({
        email: data.admins[0].email,
        password: data.admins[0].password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end (err, res) ->
        return 'error' if not res.body.success or res.body.error
        cookie = res.headers['set-cookie']
        done()

    user = data.users[4]

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
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              users = (u.email for u in res.body.users)
              users.must.not.include user.email
          )
          .end(done)