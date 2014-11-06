must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null
cookie2 = null

describe 'API v1: /menus', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done


  describe 'GET /api/v1/menus', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by published date'
    describe 'on normal request', ->
      it 'paginates properly'


  describe 'PUT /api/v1/menu/:menu/published', ->
    describe 'if not logged in', ->
      it 'returns error', (done) ->
        slug = 'test-menu-draft'
        request
        .put('/api/v1/menu/' + slug + '/published')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'if not menu owner', ->
      before (done) ->
        utils.loginUser data.users[4], request, (err, res) ->
          cookie2 = res.headers['set-cookie']
          done()
      it 'returns error', (done) ->
        slug = 'test-menu-draft'
        request
        .put('/api/v1/menu/' + slug + '/published')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie2)
        .expect('Content-Type', /json/)
        .expect(404)
        .end(done)

    describe 'if menu has no recipes', ->
      it 'does nothing and returns error', (done) ->
        slug = 'test-menu-empty'
        request
        .put('/api/v1/menu/' + slug + '/published')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt false or res.body.error isnt true
              return 'Unexpected success'
        )
        .end(done)

    describe 'if menu is already published', ->
      it 'does nothing and returns success', (done) ->
        slug = 'test-menu-published'
        request
        .put('/api/v1/menu/' + slug + '/published')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Publish failed'
        )
        .end(done)

    describe 'if menu is a draft', ->
      it 'publishes it and returns success', (done) ->
        slug = 'test-menu-draft'
        request
        .put('/api/v1/menu/' + slug + '/published')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Publish failed'
        )
        .end(done)


  describe 'PUT /api/v1/menu/:menu/draft', ->

    describe 'if menu is published', ->
      it 'unpublishes it and returns success', (done) ->
        slug = 'test-menu-published'
        request
        .put('/api/v1/menu/' + slug + '/draft')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Unpublish failed'
        )
        .end(done)

    describe 'if menu is already a draft', ->
      it 'does nothing and returns success', (done) ->
        slug = 'test-menu-draft'
        request
        .put('/api/v1/menu/' + slug + '/draft')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/menu/' + slug)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Unpublish failed'
        )
        .end(done)
