must = require 'must'
keystone = null
config = require __dirname + '/../../config.js'
data = require __dirname + '/../data.json'

request = require('supertest') config.keystone.publicUrl

getFormErrors = (text, expected) ->
  errorDetector = new RegExp 'field error\-here', 'ig'
  matches = text.match(errorDetector)
  count = if matches then matches.length else 0
  if count isnt expected
    return "invalid number of errors, expected #{expected} found #{count}"

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp
  if text.match(antiRE) isnt null
    return "text found: #{text}"

describe 'LOGIN', ->
  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, done

  describe 'GET /acceso', ->
    it 'responds with the form', (done) ->
      request
      .get('/acceso')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Correo electrónico/)
      .expect(/Contraseña/)
      .end(done)

  describe 'POST /acceso', ->
    describe 'on empty action', ->
      it 'responds with the form, no errors', (done) ->
        request
        .post('/acceso')
        .send({
          'action': ''
        })
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 0
        )
        .expect(/Correo electrónico/)
        .expect(/Contraseña/)
        .end(done)

    describe 'on signup fields received', ->
      it 'ignores them and shouts 2 errors'
      , (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'signup_email': 'TestDummyEmail'
          'signup_password': ''
        })
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 2
        )
        .expect(
          (res) -> return antiRegExp res.text, 'TestDummyEmail'
        )
        .end(done)

    describe 'on some fields missing', ->
      it 'responds with 1 error for missing password & pre-filled email'
      , (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': 'TestDummyEmail'
          'login_password': ''
        })
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 1
        )
        .expect(/TestDummyEmail/)
        .end(done)

      it 'responds with 2 errors for 2 empty fields', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': ''
          'login_password': ''
        })
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 2
        )
        .end(done)

    describe 'on valid user credentials', ->
      it 'grants access', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': data.users[0].password
        })
        .expect(302)
        .end(done)

    describe 'on invalid password', ->
      it 'responds with 2 errors', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': 'TestDummyPassword'
        })
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 2
        )
        .end(done)

    describe 'on password received for an user without password', ->
      it 'responds with 1 error', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': data.users[1].email
          'login_password': 'TestDummyPassword'
        })
        .expect(200)
        .expect(
          (res) -> return getFormErrors res.text, 1
        )
        .end(done)
