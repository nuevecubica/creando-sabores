must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Videorecipe: View', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  slug = 'test-videorecipe-1'
  cookies = null

  describe 'get /videoreceta/:recipe', ->
    describe 'on anonymous user', ->
      it 'returns the recipe', (done) ->
        request
        .get('/videoreceta/' + slug)
        .expect(200)
        .end(done)

    describe 'on author', ->
      before (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.users[0].email,
          password: data.users[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'returns the recipe', (done) ->
        request
        .get('/videoreceta/' + slug)
        .set('cookie', cookie)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      before (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.users[2].email,
          password: data.users[2].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'returns the recipe', (done) ->
        request
        .get('/videoreceta/' + slug)
        .set('cookie', cookie)
        .expect(200)
        .end(done)