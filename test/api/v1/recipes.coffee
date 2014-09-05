must = require 'must'
keystone = null
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data.json'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe.only 'API v1: /recipes', ->

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
        .get('/api/v1/recipes')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.recipes.currentPage != 1
              return 'Got unexpected results page'
            if res.body.recipes.results.length < 2
              many = res.body.recipes.results.length
              return 'Got too few results (' + many + ')'
            prevrating = res.body.recipes.results[0].rating
            for recipe in res.body.recipes.results
              if recipe.rating > prevrating
                return 'Unordered results'
              prevrating = recipe.rating
              if recipe.state != 1
                return 'Unpublished recipe received'
              if recipe.banned
                return 'Banned recipe received'
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/recipes?perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          request
          .get('/api/v1/recipes?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res2) ->
              if res2.body.recipes.results.length != 2
                return 'Unexpected results number'
              oldres = res.body.recipes.results
              newres = res2.body.recipes.results
              if oldres[2].slug != newres[0].slug or
                  oldres[3].slug != newres[1].slug
                return 'Pagination order failure'
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
            if res.body.recipes.results.length < 2
              many = res.body.recipes.results.length
              return 'Got too few results (' + many + ')'
            preveditdate = res.body.recipes.results[0].editDate
            for recipe in res.body.recipes.results
              if recipe.editDate > preveditdate
                return 'Unordered results'
              prevrating = recipe.rating
              if recipe.state != 1
                return 'Unpublished recipe received'
              if recipe.banned
                return 'Banned recipe received'
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/user/testUser1/recipes?perPage=2')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          request
          .get('/api/v1/user/testUser1/recipes?page=2&perPage=1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res2) ->
              if res2.body.recipes.results.length != 1
                return 'Unexpected results number'
              oldres = res.body.recipes.results
              newres = res2.body.recipes.results
              if oldres[1].slug != newres[0].slug
                return 'Pagination order failure'
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
        .get('/api/v1/me/recipes')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Unexpected status values'
            if res.body.recipes.results.length < 2
              many = res.body.recipes.results.length
              return 'Got too few results (' + many + ')'
            anyBanned = false
            anyDraft = false
            preveditdate = res.body.recipes.results[0].editDate
            for recipe in res.body.recipes.results
              anyBanned = anyBanned or recipe.isBanned
              anyDraft = anyDraft or recipe.state == 0
              if recipe.editDate > preveditdate
                return 'Unordered results'
              preveditdate = recipe.editDate
            if not anyBanned
              return 'Banned recipes not returned'
            if not anyDraft
              return 'Recipe drafts not returned'
        )
        .end(done)

      it 'paginates properly', (done) ->
        request
        .get('/api/v1/me/recipes?perPage=4')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          request
          .get('/api/v1/me/recipes?page=2&perPage=2')
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res2) ->
              if res2.body.recipes.results.length != 2
                return 'Unexpected results number'
              oldres = res.body.recipes.results
              newres = res2.body.recipes.results
              if oldres[2].slug != newres[0].slug or
                  oldres[3].slug != newres[1].slug
                return 'Pagination order failure'
          )
          .end(done)
