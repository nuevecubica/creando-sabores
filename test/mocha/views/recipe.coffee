must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe.only 'Recipe: View', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  cookies = null

  describe 'get /receta/:recipe', ->
    slug = 'test-recipe-1'

    describe 'on anonymous user', ->
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
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
        .get('/receta/' + slug)
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
        .get('/receta/' + slug)
        .set('cookie', cookie)
        .expect(200)
        .end(done)

  # ----

  describe 'get /receta/:recipe with unpublished recipe', ->
    slug = 'test-recipe-unpublished'
    describe 'on anonymous user', ->
      it 'returns an error', (done) ->
        request
        .get('/receta/' + slug)
        .expect(404)
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
        .get('/receta/' + slug)
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

      it 'returns an error', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie)
        .expect(404)
        .end(done)
