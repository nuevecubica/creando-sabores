must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
token = null
oldToken = null

describe 'Reset password:', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  after (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get url', ->
    describe 'with invalid token', ->
      it 'redirects to forgotten password', (done) ->
        request
        .get('/nueva-contrasena/resetPasswordTokenFake')
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/contrasena-olvidada'
              return 'Wrong redirect to ' + res.header['location']
        )
        .end(done)

    describe 'with valid token', ->
      user = data.users[0]

      beforeEach (done) ->
        this.timeout 10000
        user = data.users[0]

        request
        .post('/contrasena-olvidada')
        .send({
          action: 'forgotten-password'
          email: user.email
        })
        .expect(302)
        .end (err, res) ->
          request
          .get('/api/v1/test/getUser?username=' + user.username)
          .expect(
            (res) ->
              if !res.body.user or !res.body.user.resetPasswordToken
                return 'No token found: ' +
                  (res.body.user.resetPasswordToken || null)
          )
          .end (err, res) ->
            token = res.body.user.resetPasswordToken
            password = res.body.user.password
            done()

      it 'responds with the form', (done) ->
        request
        .get('/nueva-contrasena/' + token)
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/reset-password/)
        .expect(/password/)
        .expect(/password_confirm/)
        .expect(/submit/)
        .end(done)

      describe 'submit a new password', ->
        describe 'valid', ->
          it 'saves the password and redirects to login', (done) ->
            request
            .post('/nueva-contrasena/' + token)
            .send({
              action: 'reset-password'
              password: 'dummyPassword'
              password_confirm: 'dummyPassword'
            })
            .expect(302)
            .expect(
              (res) ->
                if res.header['location'] isnt '/acceso' and
                    res.header['api-response-success'] is 'false'
                  return 'Wrong status headers.' +
                  ' Success: ' + res.header['api-response-success'] +
                  ' / Error: ' + res.header['api-response-error']
            )
            .end (err, res) ->
              request
              .get('/api/v1/test/getUser?username=' + user.username)
              .expect(
                (res) ->
                  if res.body.user.password is password
                    return "Password not changed: #{res.body.user.password} " +
                      "is #{password}"
              )
              .end (err, res) ->
                utils.loginUser {
                  email: user.email
                  password: 'dummyPassword'
                }, request, done

      describe 'try to use the same token twice', ->
        it 'redirects to forgotten password', (done) ->
          request
          .post('/nueva-contrasena/' + token)
          .send({
            action: 'reset-password'
            password: 'dummyPassword'
            password_confirm: 'dummyPassword'
          })
          .expect(302)
          .expect(
            (res) ->
              if res.header['location'] isnt '/acceso'
                return 'Wrong redirect: ' + res.header['location']
          )
          .end (err, res) ->
            request
              .get('/nueva-contrasena/' + token)
              .expect(302)
              .expect(
                (res) ->
                  if res.header['location'] isnt '/contrasena-olvidada'
                    return 'Wrong redirect to ' + res.header['location']
              )
              .end(done)