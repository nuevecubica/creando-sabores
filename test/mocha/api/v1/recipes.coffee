must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data.json'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /recipes', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done


  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'GET /recipes', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by rating', (done) ->
        request
        .get('/api/v1/recipes?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.recipes.currentPage != 1
              return 'Got unexpected results page'
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1 and
              not recipe.contest
            recipes.sort (a,b) -> return b.rating - a.rating
            if recipes.length > 5
              recipes = recipes.slice 0, 5
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/recipes?page=2&perPage=2')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1 and
              not recipe.contest
            recipes.sort (a,b) -> return b.rating - a.rating
            recipes = recipes.slice 2, 4
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)


  describe 'GET /user/recipes', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by edit date', (done) ->
        request
        .get('/api/v1/user/testUser1/recipes')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.recipes.currentPage != 1
              return 'Got unexpected results page'
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1 and
              recipe.author == 1 and (not recipe.contest or
              recipe.contest.state == 'admited')
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            if recipes.length > res.body.recipes.results.length
              recipes = recipes.slice 0, res.body.recipes.results.length
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/user/testUser1/recipes?page=2&perPage=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1 and
              recipe.author == 1  and (not recipe.contest or
              recipe.contest.state == 'admited')
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            recipes = recipes.slice 1, 2
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

  describe 'GET /me/recipes', ->
    describe 'on unauthenticated request', ->
      it 'responds with error', (done) ->
        request
        .get('/api/v1/me/recipes')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .expect(
          (res) ->
            if res.body.success isnt false or res.body.error isnt false
              return 'Unexpected status values'
        )
        .end(done)

    describe 'on authenticated request', ->
      beforeEach (done) ->
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

      it 'responds with all recipes (even banned, unpublished)', (done) ->
        request
        .get('/api/v1/me/recipes?perPage=10')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Unexpected status values'
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) -> recipe.author == 1
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            if recipes.length > 10
              recipes = recipes.slice 0, 10
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

      it 'paginates properly', (done) ->
        request
        .get('/api/v1/me/recipes?page=2&perPage=2')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) -> recipe.author == 1
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            recipes = recipes.slice 2, 4
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)
