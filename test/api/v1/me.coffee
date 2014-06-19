must = require 'must'
config = require __dirname + '/../../../config-test.js'

supertest = require('supertest')
request = supertest.agent config.url

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp
  if text.match(antiRE) isnt null
    return "text found: #{regexp}"

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

  #*---------- ME ----------*
  describe 'GET /me', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->
        request
        .get('/api/v1/me')
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->
      it 'should response the user', (done) ->
        this.timeout 5000

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
          return 'login error' if not res.body.success or res.body.error

          cookie = res.headers['set-cookie']

          request
          .get('/api/v1/me')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              return 'No user' if not res.body.user

              if res.body.user.username isnt config.lists.users[0].username
                return 'Wrong user'
          )
          .end(done)

  #*---------- LOGOUT ----------*
  describe 'GET /me/logout', ->
    describe 'on request to logout', ->
      it 'should destroy user session', (done) ->
        this.timeout = 5000

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
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']

          request
          .get('/api/v1/me')
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.user.username isnt config.lists.users[0].username
                return 'Login failed'
          )
          .end (err, res) ->

            request
            .get('/api/v1/me/logout')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              console.log cookie
              console.log res.headers['set-cookie']
              cookie = res.headers['set-cookie']

              return 'error' if not res.body.success or res.body.error

              request
              .get('/api/v1/me')
              .set('Accept', 'application/json')
              .set('cookie', cookie)
              .expect('Content-Type', /json/)
              .expect(401)
              .end(done)
