must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
token = null
oldToken = null
cookie = null

describe 'Verify email:', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get url', ->
    describe 'with invalid token', ->
      it 'redirects to home', (done) ->
        request
        .get('/confirma-email/verifyEmailTokenFake')
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/' or
                res.header['api-response-error'] is 'false'
              return 'Wrong status headers.' +
                ' Success: ' + res.header['api-response-success'] +
                ' / Error: ' + res.header['api-response-error']
        )
        .end(done)

    describe 'with valid token', ->
      user = data.users[5]

      beforeEach (done) ->
        this.timeout 10000
        user = data.users[5]

        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_name': user.username
          'signup_email': user.email
          'signup_password': user.password
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/' or
                res.header['api-response-success'] is 'false'
              return 'Wrong redirect to ' + res.header['location']
        )
        .end (err, res) ->
          return done(err) if err

          cookie = res.headers['set-cookie']
          request
          .get('/api/v1/test/getUser?username=' + user.username)
          .set('cookie', cookie)
          .expect(
            (res) ->
              if !res.body.user or !res.body.user.verifyEmailToken
                return 'No token found: ' +
                  (res.body.user.resetPasswordToken || null)
          )
          .end (err, res) ->
            return done(err) if err

            token = res.body.user.verifyEmailToken
            done()

      it 'confirms the email and redirects to home', (done) ->
        request
        .get('/confirma-email/' + token)
        .set('cookie', cookie)
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/' and
                res.header['api-response-success'] is 'false'
              return 'Wrong status headers.' +
                ' Success: ' + res.header['api-response-success'] +
                ' / Error: ' + res.header['api-response-error']
        )
        .end (err, res) ->
          return done(err) if err

          request
          .get('/api/v1/test/getUser?username=' + user.username)
          .expect(
            (res) ->
              if !res.body.user.isConfirmed
                return "User not confirmed"
          )
          .end done

      describe 'without login', ->
        it 'redirects to login', (done) ->
          request
          .get('/confirma-email/' + token)
          .expect(302)
          .expect(
            (res) ->
              if res.header['location'] isnt '/acceso' and
                  res.header['api-response-success'] is 'false'
                return 'Wrong status headers.' +
                  ' Success: ' + res.header['api-response-success'] +
                  ' / Error: ' + res.header['api-response-error']
          )
          .end done

      describe 'try to use the same token twice', ->
        it 'redirects to home with error', (done) ->
          request
          .get('/confirma-email/' + token)
          .set('cookie', cookie)
          .expect(302)
          .expect(
            (res) ->
              if res.header['location'] isnt '/' and
                  res.header['api-response-success'] is 'false'
                return 'Wrong status headers.' +
                  ' Success: ' + res.header['api-response-success'] +
                  ' / Error: ' + res.header['api-response-error']
          )
          .end (err, res) ->
            return done(err) if err

            request
            .get('/confirma-email/' + token)
            .set('cookie', cookie)
            .expect(302)
            .expect(
              (res) ->
                if res.header['location'] isnt '/' and
                    res.header['api-response-success'] isnt 'false'
                  return 'Wrong status headers.' +
                    ' Success: ' + res.header['api-response-success'] +
                    ' / Error: ' + res.header['api-response-error']
            )
            .end(done)