must = require 'must'
keystone = null
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'

request = require('supertest') config.keystone.publicUrl

describe 'API v1: /user/menus', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase done

  afterEach (done) ->
    utils.revertTestDatabase.call this, done


  describe 'on request without args', ->
    it 'responds with first page, sorted by published date', (done) ->
      request
      .get('/api/v1/user/testuser1/menus')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(
        (res) ->
          if res.body.success isnt true or res.body.error isnt false
            return 'No arguments query failed'
          if res.body.menus.currentPage != 1
            return 'Got unexpected results page'

          res.body.menus.results.length.must.be.gte 2
          past = null
          user = data.getUserByUsername 'testuser1'
          userMenus = data.getBy 'menus', 'author', user._id
          userMenusSlugs = userMenus.map (menu) ->
            return menu.slug
          for menu, i in res.body.menus.results
            if userMenusSlugs.indexOf(menu.slug) == -1
              return "Wrong author: #{menu.slug}"
            if past && menu.publishedDate > past
              msg = 'publishedDate order failed: '
              msg += "#{menu.publishedDate} > #{past}"
              return msg
            past = menu.publishedDate
      )
      .end(done)

  describe 'on normal request', ->
    it 'paginates properly', (done) ->
      request
      .get('/api/v1/user/testuser1/menus?page=1&perPage=2')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(
        (res) ->
          res.body.menus.results.length.must.be.eql 2
      )
      .end (err, res) ->

        total = res.body.menus.results

        request
        .get('/api/v1/user/testuser1/menus?page=2&perPage=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            # Compare results
            slugsexpected = (r.slug for r in total.slice(1, 2))
            slugsgot = (r.slug for r in res.body.menus.results)
            slugsgot.must.be.eql slugsexpected
        )
        .end(done)