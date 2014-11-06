must = require 'must'
keystone = null
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /me/menus', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done


  describe 'on unauthenticated request', ->
    it 'responds with error', (done) ->
      request
      .get('/api/v1/me/menus')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .expect(
        (res) ->
          if res.body.success or not res.body.error
            return 'Unexpected status values'
      )
      .end(done)

  describe 'on authenticated request', ->
    it 'responds with all menus (even banned, unpublished)', (done) ->
      request
      .get('/api/v1/me/menus?perPage=20')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(
        (res) ->
          if res.body.success isnt true or res.body.error isnt false
            return 'Unexpected status values'

          res.body.menus.results.length.must.be.lte 20
          user = data.getUserByUsername 'testuser1'
          userMenus = data.getBy 'menus', 'author', user._id
          userMenusSlugs = userMenus.map (menu) ->
            return menu.slug
          banOrDraft = false
          for menu in res.body.menus.results
            if userMenusSlugs.indexOf(menu.slug) == -1
              return "Wrong author: #{menu.slug}"
            if ['draft', 'banned', 'review'].indexOf(menu.state) >= 0
              banOrDraft = true

          if not banOrDraft
            return 'No private menus found. Test unsuccesful?'
      )
      .end(done)

    it 'paginates properly', (done) ->
      request
      .get('/api/v1/me/menus?page=1&perPage=4')
      .set('Accept', 'application/json')
      .set('cookie', cookie)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(
        (res) ->
          res.body.menus.results.length.must.be.eql 4
      )
      .end (err, res) ->
        return done(err) if err

        total = res.body.menus.results

        request
        .get('/api/v1/me/menus?page=2&perPage=2')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            slugsexpected = (r.slug for r in total.slice(2, 4))
            slugsgot = (r.slug for r in res.body.menus.results)
            slugsgot.must.be.eql slugsexpected
        )
        .end(done)
