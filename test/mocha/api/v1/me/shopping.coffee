must = require 'must'
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'
async = require 'async'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

describe 'API v1: /me/shopping', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase (err) ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /me/shopping/:action/:recipe', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->

        recipe = data.getBySlug 'recipes', 'test-recipe-1'

        request
        .put('/api/v1/me/shopping/add/' + recipe.slug)
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->

      describe 'on shopping list add a recipe not published', (done) ->
        it 'should response an error', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-banned'

          request
          .put('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on shopping list add', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .put('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/shopping/list')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                res.body.recipes.results.length.must.be.equal 1
                res.body.recipes.total.must.be.equal 1
                slug = res.body.recipes.results[0].slug
                slug.must.be.equal recipe.slug
            ).end(done)

        it 'should ignore duplicate requests', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .put('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .put('/api/v1/me/shopping/add/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              return done(err) if err

              request
              .get('/api/v1/me/shopping/list')
              .set('cookie', cookie)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(
                (res) ->
                  res.body.recipes.total.must.be.equal 1
                  slug = res.body.recipes.results[0].slug
                  slug.must.be.equal recipe.slug
              )
              .end(done)

        it 'should return error for missing recipe', (done) ->
          request
          .put('/api/v1/me/shopping/add/testDummyRecipe')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on shopping list remove', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .put('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .put('/api/v1/me/shopping/remove/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              request
              .get('/api/v1/me/shopping/list')
              .set('cookie', cookie)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(
                (res) ->
                  res.body.recipes.total.must.be.equal 0
              ).end(done)

        it 'should ignore duplicate requests', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .put('/api/v1/me/shopping/remove/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done)

        it 'should return error for missing recipe', (done) ->
          request
          .put('/api/v1/me/shopping/remove/testDummyRecipe')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

  describe 'GET /me/shopping/list', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->
        request
        .get('/api/v1/me/shopping/list')
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->
      this.timeout 20000

      it 'should paginate properly', (done) ->

        addToShoppingList = (recipe, cb) ->
          request
          .put('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(cb)

        recipes = data.getRecipesBy 'state', 'published'

        async.each recipes.slice(0, 4), addToShoppingList, ->
          request
          .get('/api/v1/me/shopping/list?page=1&perPage=4')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.recipes.total.must.be.gte 4
              res.body.recipes.results.length.must.be.equal 4
          )
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/shopping/list?page=2&perPage=2')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res2) ->
                res2.body.recipes.total.must.be.gte 4
                res2.body.recipes.results.length.must.be.equal 2
                part = res.body.recipes.results.slice(2,5)
                res2.body.recipes.results.must.be.eql part
            )
            .end(done)

      it 'should update the list, removing invalid references', (done) ->
        utils.loginUser data.users[2], request, (err, res) ->

          cookie2 = res.headers['set-cookie']

          request
          .get('/api/v1/me/shopping/list?perPage=20')
          .set('cookie', cookie2)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.recipes.total.must.be.equal 1
              res.body.recipes.results.length.must.be.equal 1
          )
          .end(done)
