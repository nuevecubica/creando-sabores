must = require 'must'
keystone = null
config = require __dirname + '/../../config-test.js'

request = require('supertest') config.url

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

describe 'SIGNUP', ->
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
      .expect(/Correo electrónico/)
      .end(done)

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
          (res) -> return getFormErrors res.text, 0
        )
        .expect(/Nombre de usuario/)
        .expect(/Correo electrónico/)
        .end(done)

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
          (res) -> return getFormErrors res.text, 1
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
          (res) -> return getFormErrors res.text, 2
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
          (res) -> return getFormErrors res.text, 3
        )
        .end(done)

    describe 'on valid login credentials', ->
      it 'login success without username', (done) ->
        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_email': config.lists.users[0].email
          'signup_password': config.lists.users[0].password
        })
        .expect(302)
        .end(done)

      it 'login success with dummy username', (done) ->
        request
        .post('/registro')
        .send({
          'action': 'signup'
          'signup_name': 'TestDummyName'
          'signup_email': config.lists.users[0].email
          'signup_password': config.lists.users[0].password
        })
        .expect(302)
        .end(done)

