must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe.only 'Recipe: View', ->

  cookie1 = null
  cookie2 = null

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase (err, res) ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie1 = res.headers['set-cookie']
          utils.loginUser data.users[2], request, (err, res) ->
            cookie2 = res.headers['set-cookie']
            done(err, res)

  describe 'get /receta/:recipe', ->
    slug = 'test-recipe-1'

    describe 'on anonymous user', ->
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
        .expect(200)
        .end(done)

    describe 'on author', ->
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie1)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie2)
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
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie1)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns an error', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie2)
        .expect(404)
        .end(done)

  # ----

  describe 'get /receta/:recipe with on review recipe', ->
    slug = 'test-contest-recipe-4'
    describe 'on anonymous user', ->
      it 'returns an error', (done) ->
        request
        .get('/receta/' + slug)
        .expect(404)
        .end(done)

    describe 'on author', ->
      it 'returns the recipe', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie1)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns an error', (done) ->
        request
        .get('/receta/' + slug)
        .set('cookie', cookie2)
        .expect(404)
        .end(done)
