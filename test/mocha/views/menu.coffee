must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Menu: View', ->

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

  describe 'get /menu/:menu', ->
    slug = 'test-menu-published'

    describe 'on anonymous user', ->
      it 'returns the menu', (done) ->
        request
        .get('/menu/' + slug)
        .set('cookie', '')
        .expect(200)
        .end(done)

    describe 'on author', ->
      it 'returns the menu', (done) ->
        request
        .get('/menu/' + slug)
        .set('cookie', cookie1)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns the menu', (done) ->
        request
        .get('/menu/' + slug)
        .set('cookie', cookie2)
        .expect(200)
        .end(done)

  # ----

  describe 'get /menu/:menu with unpublished menu', ->
    slug = 'test-menu-draft'
    describe 'on anonymous user', ->
      it 'returns an error', (done) ->
        request
        .get('/menu/' + slug)
        .expect(404)
        .end(done)

    describe 'on author', ->
      it 'returns the menu', (done) ->
        request
        .get('/menu/' + slug)
        .set('cookie', cookie1)
        .expect(200)
        .end(done)

    describe 'on other user', ->
      it 'returns an error', (done) ->
        request
        .get('/menu/' + slug)
        .set('cookie', cookie2)
        .expect(404)
        .end(done)

  # ----

  describe 'get /menu/:menu with unavailable recipes', ->
    slug = 'test-menu-with-unavailable-recipes'
    it 'shows recipes as unavailable', (done) ->
      request
      .get('/menu/' + slug)
      .set('cookie','')
      .expect(200)
      .end (err, res) ->
        return done(err) if err

        (res.text.match(/recipe /g) || []).length.must.be 5
        (res.text.match(/unavailable /g) || []).length.must.be 6
        res.text.must.not.match /DESCRIPTION BANNED/

        done err