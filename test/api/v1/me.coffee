must = require 'must'
config = require __dirname + '/../../../config-test.js'

supertest = require('supertest')
request = supertest.agent config.url

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp
  if text.match(antiRE) isnt null
    return "text found: #{text}"

describe 'API v1: /me/', ->
  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, done

  #*---------- LOGIN ----------*
  describe 'POST /me/login', ->

    describe 'with no data', ->
      it 'responds with error', (done) ->
        request
        .post('/api/v1/me/login')
        .send({})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect (res) ->
          return 'error' if !res.body.error or res.body.success
        .end(done)

    describe 'with invalid credentials', ->
      it 'responds with unsuccess', (done) ->
        request
        .post('/api/v1/me/login')
        .send({
          email: config.lists.users[0].email,
          password: 'garbage'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect (res) ->
          return 'error' if res.body.success or res.body.error
        .end(done)

    describe 'with valid credentials', ->
      it 'responds with success', (done) ->
        request
        .post('/api/v1/me/login')
        .send({
          email: config.lists.users[0].email,
          password: config.lists.users[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if !res.body.success or res.body.error
          cookie = res.headers['set-cookie']

          request
          .get('/')
          .set('cookie', cookie)
          .expect(200)
          .expect(new RegExp(config.lists.users[0].name))
          .end(done)

  #*---------- LOGOUT ----------*
  describe 'GET /me/logout', ->
    describe 'on request to logout', ->
      it 'should destroy user session', (done) ->
        request
        .get('/api/v1/me/logout')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if !res.body.success or res.body.error
          cookie = res.headers['set-cookie']

          request
          .get('/')
          .set('cookie', cookie)
          .expect(200)
          .expect (
            (res) -> return antiRegExp(res.text, config.lists.users[0].name)
          )
          .end(done)
