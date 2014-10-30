must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

describe 'API v1: /notifications', ->
  cookie = null

  dummy = {
    email: 'dummy@ema.il'
    token: '000000000000'
  }

  beforeEach (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'PUT /api/v1/notifications/:email/:token/subscribe/newsletter', ->

    user = data.getUserByUsername 'testuser3'

    before (done) ->
      request
      .get('/api/v1/test/getNewsletterUsers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        if !res.body.users
          return 'No users'
        for _user in res.body.users
          if _user.email is user.email
            user.token = _user.token
        return null
      .end(done)

    describe 'on request invalid email and token', ->
      it 'responds with not found', (done) ->
        request
        .put('/api/v1/notifications/' + dummy.email + '/' + dummy.token +
          '/subscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done)

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
          return done(err) if err

          request
          .get('/api/v1/test/getNewsletterUsers')
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

    user = data.getUserByUsername 'testuser4'

    before (done) ->
      request
      .get('/api/v1/test/getNewsletterUsers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        if !res.body.users
          return 'No users'
        for _user in res.body.users
          if _user.email is user.email
            user.token = _user.token
        return null
      .end(done)

    describe 'on request invalid email and token', ->
      it 'responds with not found', (done) ->
        request
        .put('/api/v1/notifications/' + dummy.email + '/' + dummy.token +
          '/unsubscribe/newsletter')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done)

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
            if res.body.success is false or res.body.error is true
              return "Invalid headers. #{res.body.error} / #{res.body.success}"
        )
        .end (err, res) ->
          return done(err) if err

          request
          .get('/api/v1/test/getNewsletterUsers/newsletter')
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              (u.email for u in res.body.users).must.not.include user.email
          )
          .end(done)
