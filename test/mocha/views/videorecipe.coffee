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
      utils.revertTestDatabase (err) ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

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
      it 'returns the recipe', (done) ->
        request
        .get('/videoreceta/' + slug)
        .set('cookie', cookie)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns the recipe', (done) ->
        request
        .get('/videoreceta/' + slug)
        .set('cookie', cookie)
        .expect(200)
        .end(done)
