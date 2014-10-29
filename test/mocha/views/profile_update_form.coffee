must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe '(Private) Profile: Update', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  beforeEach (done) ->
    this.timeout 10000
    utils.loginUser data.users[0], request, (err, res) ->
      cookie = res.headers['set-cookie']
      done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get user profile', ->
    it 'responds with the form', (done) ->
      request
      .get('/perfil')
      .set('cookie', cookie)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/username/)
      .expect(/email/)
      .expect(/old-pass/)
      .expect(/new-pass/)
      .expect(/isPrivate/)
      .end(done)

  describe 'submit /perfil/change', ->

    describe 'on empty action', ->
      it 'returns an error', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Error saving profile'
              return 'Wrong status headers'
        )
        .end(done)

    describe 'on modified data', ->
      it 'updates user data', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[0].username,
          'email': 'demo@email.com',
          'isPrivate': true
          'old-pass': '',
          'new-pass': ''
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'Profile saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Edit Wrong status headers'
        )
        .end (err, res) ->
          return done(err) if err

          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt 'demo@email.com' or
                    not res.body.user.isPrivate
                  return 'Edit failed'
            )
            .end (err, res) ->
              return done(err) if err

              request
                .post('/perfil/change')
                .set('cookie', cookie)
                .send({
                  'username': data.users[0].username,
                  'email': 'demo@email.com',
                })
                .expect(302)
                .expect(
                  (res) ->
                    if res.header['location'] isnt '/perfil/change/..' or
                        res.header['api-response-success'] isnt
                        'Profile saved' or
                        res.header['api-response-error'] isnt 'false'
                      return 'Revert private Wrong status headers'
                )
                .end (err, res) ->
                  return done(err) if err

                  request
                    .get('/api/v1/me')
                    .set('Accept', 'application/json')
                    .set('cookie', cookie)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .expect(
                      (res) ->
                        if res.body.user.isPrivate
                          return 'Revert private failed'
                    )
                    .end(done)

      it 'changes the password', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[0].username,
          'email': data.users[0].email,
          'old-pass': data.users[0].password,
          'new-pass': 'demo-pass'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'Profile saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers'
        )
        .end (err, res) ->
          return done(err) if err

          request
            .post('/api/v1/login')
            .send({
              email: data.users[0].email,
              password: 'demo-pass'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done)

    describe 'on bad data', ->
      it 'rejects repeated email', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[0].username,
          'email': data.users[1].email
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Error saving profile'
              return "Wrong status headers.
 Received: \"#{res.header['api-response-error']},
  #{res.header['api-response-success']}\".
 Expected: \"Error saving profile, false\"."
        )
        .end (err, res) ->
          return done(err) if err

          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt data.users[0].email
                  return 'Email changed on collision'
            )
            .end(done)

      it 'rejects repeated username', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[1].username,
          'email': data.users[0].email
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Error saving profile'
              return "Wrong status headers.
 Received: \"#{res.header['api-response-error']},
  #{res.header['api-response-success']}\".
 Expected: \"Error saving profile, false\"."
        )
        .end (err, res) ->
          return done(err) if err

          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.username isnt data.users[0].username
                  return 'Username changed on collision'
            )
            .end(done)

      it 'rejects bad password', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[0].username
          'email': data.users[0].email
          'old-pass': 'bad-password',
          'new-pass': 'demo-password'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt
                'Error: Password not match'
              return 'Wrong status headers'
        )
        .end (err, res) ->
          return done(err) if err

          request
            .post('/api/v1/login')
            .send({
              email: data.users[0].email,
              password: data.users[0].password
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done)

      it 'rejects invalid email', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': data.users[0].username,
          'email': 'dummyEmail'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil/change/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Error: Email format'
              return 'Wrong status headers'
        )
        .end (err, res) ->
          return done(err) if err

          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt data.users[0].email
                  return 'Email changed on invalid format'
            )
            .end(done)
