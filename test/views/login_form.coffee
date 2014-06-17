must = require 'must'
keystone = null
config = require __dirname + '/../../config-test.js'

request = require('supertest') config.url

getErrors = (text) ->
  errorDetector = new RegExp 'field error-here', 'ig'
  matches = 0
  while match = errorDetector.exec(text) isnt null
    matches++

  return matches

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp, 'ig'
  matches = 0
  while match = antiRE.exec(text) isnt null
    matches++

  return true if matches is 0

describe 'API v1: /user', ->
  before (done) ->
    this.timeout 10000

    keystone = require __dirname + '/../../app-test-init.js'

    Users = keystone.list 'User'
    for user in config.lists.users
      userM = new Users.model()
      userM.name     = user.name
      userM.username = user.username
      userM.email    = user.email
      userM.password = user.password
      userM.save()

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
          (res) -> return true if getErrors res.text isnt 0
        )
        .expect(/Correo electrónico/)
        .expect(/Contraseña/)
        .end(done)

    describe 'on signup fields received', ->
      it 'ignores them and shout 2 errors'
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
          (res) ->
            return true if getErrors res.text isnt 2
        )
        .expect(
          (res) ->
            return true if !antiRegExp res.text, 'TestDummyEmail'
        )
        .end(done)

    describe 'on some fields missing', ->
      it 'responds with error for missing password & pre-filled email'
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
          (res) -> return true if getErrors res.text isnt 1
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
          (res) -> return true if getErrors res.text isnt 2
        )
        .end(done)

    describe 'on valid user credentials', ->
      it 'grants access', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': config.lists.users[0].email
          'login_password': config.lists.users[0].password
        })
        .expect(302)
        .end(done)

    describe 'on password received for an user without password', ->
      it 'responds with an error', (done) ->
        request
        .post('/acceso')
        .send({
          'action': 'login'
          'login_email': config.lists.users[1].email
          'login_password': 'TestDummyPassword'
        })
        .expect(200)
        .expect(
          (res) -> return true if getErrors res.text isnt 1
        )
        .end(done)
