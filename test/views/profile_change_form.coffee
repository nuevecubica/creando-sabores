must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config-test.js'
utils = require __dirname + '/../utils.js'


request = require('supertest') config.url
cookie = null

describe 'PRIVATE PROFILE - CHANGE', ->

  before (done) ->
    this.timeout 10000
    request
      .post('/acceso')
      .send({
        'action': 'login'
        'login_email': config.lists.users[0].email
        'login_password': config.lists.users[0].password
      })
      .expect(302)
      .end (err, res) ->
        if err
          return done err, res
        cookie = res.headers['set-cookie']
        done()

  afterEach (done) ->
    utils.revertTestUsers done

  describe 'GET /perfil', ->
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

  describe 'POST /perfil/change', ->
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
          'username': config.lists.users[0].username,
          'email': 'demo@email.com',
          'isPrivate': 'on'
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
          if err
            return done err, res
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
              if err
                return done err, res
              request
                .post('/perfil/change')
                .set('cookie', cookie)
                .send({
                  'username': config.lists.users[0].username,
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
                  if err
                    return done err, res
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
          'username': config.lists.users[0].username,
          'email': config.lists.users[0].email,
          'old-pass': config.lists.users[0].password,
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
          if err
            return done err, res
          request
            .post('/api/v1/login')
            .send({
              email: config.lists.users[0].email,
              password: 'demo-pass'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done)

      it 'rejects repeated email', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': config.lists.users[0].username,
          'email': config.lists.users[1].email
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
          if err
            return done err, res
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt config.lists.users[0].email
                  return 'Email changed on collision'
            )
            .end(done)

      it 'rejects bad password', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': config.lists.users[0].username
          'email': config.lists.users[0].email
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
          if err
            return done err, res
          request
            .post('/api/v1/login')
            .send({
              email: config.lists.users[0].email,
              password: config.lists.users[0].password
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
          'username': config.lists.users[0].username,
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
          if err
            return done err, res
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt config.lists.users[0].email
                  return 'Email changed on invalid format'
            )
            .end(done)
