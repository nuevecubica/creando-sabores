must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /seasonLists', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /seasonLists', ->
    describe 'on request without args', ->
      it 'responds with seasons sorted by priority, no recipes', (done) ->
        request
        .get('/api/v1/seasonLists')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'

            res.body.seasons.results.length.must.be.gte 3
            past = 999
            for season, i in res.body.seasons.results
              if season.priority > past
                return "Priority order failed: #{season.priority} <= #{past}"
              if season.recipes.length
                if typeof season.recipes[0] isnt 'string'
                  return "Recipes are populated"
              past = season.priority
        )
        .end(done)

    describe 'on populated request', ->
      it 'return seasons with recipes', (done) ->
        request
        .get('/api/v1/seasonLists?limit=3&withRecipes=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'

            res.body.seasons.results.length.must.be.eql 3
            past = 999
            for season, i in res.body.seasons.results
              if season.priority > past
                return "Priority order failed: #{season.priority} <= #{past}"
              if not season.recipes.length
                return "No recipes"
              if typeof season.recipes[0] is 'string'
                return "Recipes not populated"
              if not season.recipes[0].title
                return "Recipes without data"
              past = season.priority
        )
        .end(done)

      it 'return season without invalid recipes', (done) ->
        request
        .get('/api/v1/seasonLists?slug=test-season-published&withRecipes=1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'

            if res.body.seasons.results
              return "More than one season: #{res.body.seasons.results.length}"

            res.body.seasons.recipes.length.must.be.gt 3

            for recipe, i in res.body.seasons.recipes
              if typeof recipe is 'string'
                return "Recipe not populated"
              if ['published'].indexOf(recipe.state) is -1
                return "Invalid recipe state: #{recipe.state}"
        )
        .end(done)
