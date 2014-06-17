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

  describe 'GET /registro', ->
    it 'responds with the form', (done) ->
      request
      .get('/registro')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Nombre de usuario/)
      .expect(/Correo electrónico/, done)

  describe 'POST /registro', ->
    describe 'on empty action', ->
      it 'responds with the form, no errors', (done) ->
        request
        .post('/registro')
        .send({
          'action': ''
        })
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(
          (res) -> return true if getErrors res.text isnt 0
        )
        .expect(/Nombre de usuario/)
        .expect(/Correo electrónico/)
        .end(done)

  describe 'POST /registro', ->
    describe 'on some fields missing', ->
      it 'responds with 1 error for 1 field & 2 pre-filled fields', (done) ->
        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_name': 'TestDummyName'
          'signup_email': 'TestDummyEmail'
          'signup_password': ''
        })
        .expect(200)
        .expect(
          (res) -> return true if getErrors res.text isnt 1
        )
        .expect(/TestDummyName/)
        .expect(/TestDummyEmail/)
        .end(done)
      it 'responds with 2 errors for 2 fields & 1 pre-filled field', (done) ->
        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_name': ''
          'signup_email': 'TestDummyEmail'
          'signup_password': ''
        })
        .expect(/TestDummyEmail/)
        .expect(200)
        .expect(
          (res) -> return true if getErrors res.text isnt 2
        )
        .end(done)
      it 'responds with 3 errors for 3 fields', (done) ->
        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_name': ''
          'signup_email': ''
          'signup_password': ''
        })
        .expect(200)
        .expect(
          (res) -> return true if getErrors res.text isnt 3
        )
        .end(done)
