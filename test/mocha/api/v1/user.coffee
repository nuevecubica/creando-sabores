must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

describe 'API v1: /user', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'GET /user/:username/check', ->
    describe 'on request invalid user', ->
      it 'responds with not found', (done) ->
        request
        .get('/api/v1/user/textDummyUserName/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 404, done

    describe 'on request valid user', ->
      it 'responds with success', (done) ->
        request
        .get('/api/v1/user/' + data.users[0].username + '/check')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/).expect 200, done

  describe 'GET /user/:username/recipes', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by edit date', (done) ->
        request
        .get('/api/v1/user/testuser1/recipes')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.recipes.currentPage != 1
              return 'Got unexpected results page'

            res.body.recipes.results.length.must.be.gte 2
            past = null
            user = data.getUserByUsername 'testuser1'
            for recipe, i in res.body.recipes.results
              if recipe.author.slug isnt user.slug
                return "Wrong username: #{recipe.author}"
              if past && recipe.editDate > past
                return "editDate order failed: #{recipe.editDate} > #{past}"
              past = recipe.editDate
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/user/testuser1/recipes?page=1&perPage=2')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.recipes.results.length.must.be.eql 2
        )
        .end (err, res) ->

          total = res.body.recipes.results

          request
          .get('/api/v1/user/testuser1/recipes?page=2&perPage=1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              # Compare results
              slugsexpected = (r.slug for r in total.slice(1, 2))
              slugsgot = (r.slug for r in res.body.recipes.results)
              slugsgot.must.be.eql slugsexpected
          )
          .end(done)

    describe 'on private user', ->
      it 'access is denied', (done) ->
        request
        .get('/api/v1/user/testuserprivate/recipes?page=1&perPage=2')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

  describe 'GET /user/:username/favourites', ->
    it 'should paginate properly'
    it 'should update the list, removing invalid references'

    describe 'on private user', ->
      it 'should deny access', (done) ->
        request
        .get('/api/v1/user/testuserprivate/favourites?page=1&perPage=2')
        .set('cookie', '')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

  describe 'GET /user/:username/tips', ->
    it 'should paginate properly'
    it 'should update the list, removing invalid references'

    describe 'on private user', ->
      it 'should deny access', (done) ->
        request
        .get('/api/v1/user/testuserprivate/tips?page=1&perPage=2')
        .set('cookie', '')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)
