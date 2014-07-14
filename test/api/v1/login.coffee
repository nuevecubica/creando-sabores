must = require 'must'
config = require __dirname + '/../../../config.js'
users = require __dirname + '/../../users.json'
utils = require __dirname + '/../../utils.js'

supertest = require('supertest')
request = supertest.agent config.keystone.publicUrl

antiRegExp = (text, regexp) ->
  antiRE = new RegExp regexp
  if text.match(antiRE) isnt null
    return "text found: #{regexp}"

describe 'API v1: /login', ->

  before (done) ->
    request.get('/').expect 200, done

  afterEach (done) ->
    utils.revertTestUsers done

  #*---------- LOGIN ----------*

  describe 'with no data', ->
    it 'responds with error', (done) ->
      request
      .post('/api/v1/login')
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
      .post('/api/v1/login')
      .send({
        email: users.users[0].email,
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
      .post('/api/v1/login')
      .send({
        email: users.users[0].email,
        password: users.users[0].password
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
        .expect(new RegExp(users.users[0].name))
        .end(done)
