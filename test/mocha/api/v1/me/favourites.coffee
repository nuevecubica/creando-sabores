must = require 'must'
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'
async = require 'async'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

describe 'API v1: /me/favourites', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /me/favourites/:action/:recipe', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->

        recipe = data.getBySlug 'recipes', 'test-recipe-1'

        request
        .get('/api/v1/me/favourites/add/' + recipe.slug)
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->

      before (done) ->
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
          return done(err) if err

          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      describe 'on favourites list add', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/favourites/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/favourites/list')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                res.body.recipes.total.must.be.equal 1
                slug = res.body.recipes.results[0].slug
                slug.must.be.equal recipe.slug
            ).end(done)

        it 'should ignore duplicate requests', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/favourites/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/favourites/add/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              return done(err) if err

              request
              .get('/api/v1/me/favourites/list')
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
          .get('/api/v1/me/favourites/add/testDummyRecipe')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on favourites list remove', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/favourites/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/favourites/remove/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              return done(err) if err

              request
              .get('/api/v1/me/favourites/list')
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
          .get('/api/v1/me/favourites/remove/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done)

        it 'should return error for missing recipe', (done) ->
          request
          .get('/api/v1/me/favourites/remove/testDummyRecipe')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

  describe 'GET /me/favourites/list', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->
        request
        .get('/api/v1/me/favourites/list')
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->
      this.timeout 20000

      before (done) ->
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
          return done(err) if err

          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'should paginate properly', (done) ->

        addToShoppingList = (recipe, cb) ->
          request
          .get('/api/v1/me/favourites/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(cb)

        recipes = data.getRecipesBy 'state', 'published'

        async.each recipes.slice(0,4), addToShoppingList, ->
          request
          .get('/api/v1/me/favourites/list?page=1&perPage=4')
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
            .get('/api/v1/me/favourites/list?page=2&perPage=2')
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
        user = data.getUserByUsername('testBadUser')
        request
        .post('/api/v1/login')
        .send({
          email: data.users[2].email,
          password: data.users[2].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return done(err) if err

          return 'error' if not res.body.success or res.body.error
          cookie2 = res.headers['set-cookie']
          request
          .get('/api/v1/me/favourites/list?perPage=20')
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
