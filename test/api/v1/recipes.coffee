must = require 'must'
keystone = null
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data.json'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

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

  describe.only 'GET /recipes', ->
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

    describe 'on paginated requests', ->
      it 'responds with correct results', (done) ->
        request
        .get('/api/v1/recipes?perPage=5')
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
