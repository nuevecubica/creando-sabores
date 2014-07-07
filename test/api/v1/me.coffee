must = require 'must'
config = require __dirname + '/../../../config-test.js'
utils = require __dirname + '/../../utils.js'

supertest = require 'supertest'
request = supertest.agent config.url
cookie = null

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp
  if text.match(antiRE) isnt null
    return "text found: #{regexp}"

describe 'API v1: /me/', ->
  this.timeout 5000

  before (done) ->
    request.get('/').expect 200, done

  afterEach (done) ->
    utils.revertTestUsers done

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
        request
        .post('/api/v1/login')
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
        request
        .post('/api/v1/login')
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

              cookie = res.headers['set-cookie']
              return 'error' if not res.body.success or res.body.error

              request
              .get('/api/v1/me')
              .set('Accept', 'application/json')
              .set('cookie', cookie)
              .expect('Content-Type', /json/)
              .expect(
                (res) ->
                  return 'user logged in' if res.body.user
              )
              .expect(401)
              .end(done)

  #*---------- SAVE PROFILE ----------*
  describe 'PUT /me/save', ->
    describe 'on not logged in user', ->
      it 'should refuse changes', (done) ->
        request
        .put('/api/v1/me/save')
        .send({
          name: 'testDummyNameSave'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in user', ->
      before (done) ->
        request
        .post('/api/v1/login')
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
          done()

      describe 'on empty values', ->
        it 'should not make any changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({})
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if !res.body.success
                return 'No success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.username isnt config.lists.users[0].username
                  return 'Save failed'
            )
            .end(done)

      describe 'on invalid values', ->
        it 'should refuse changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({
            name: ''
          })
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.success
                return 'Success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.name isnt config.lists.users[0].name
                  return 'Save failed'
            )
            .end(done)

      describe 'on valid values', ->
        it 'should save changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({
            name: 'userDummyNameSave'
          })
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.success
                return 'Success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.name isnt 'userDummyNameSave'
                  return 'Save failed'
            )
            .end(done)
