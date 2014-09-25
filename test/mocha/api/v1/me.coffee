must = require 'must'
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'
async = require 'async'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

describe.only 'API v1: /me/', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  #*---------- ME ----------*
  describe 'GET /me', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->
        request
        .get('/api/v1/me')
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->
      it 'should response the user', (done) ->
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
          return 'login error' if not res.body.success or res.body.error

          cookie = res.headers['set-cookie']

          request
          .get('/api/v1/me')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              return 'No user' if not res.body.user

              if res.body.user.username isnt data.users[0].username
                return 'Wrong user'
          )
          .end(done)

  #*---------- LOGOUT ----------*
  describe 'GET /me/logout', ->
    describe 'on request to logout', ->
      it 'should destroy user session', (done) ->
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

          request
          .get('/api/v1/me')
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.user.username isnt data.users[0].username
                return 'Login failed'
          )
          .end (err, res) ->

            request
            .get('/api/v1/me/logout')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->

              cookie = res.headers['set-cookie']
              return 'error' if not res.body.success or res.body.error

              request
              .get('/api/v1/me')
              .set('Accept', 'application/json')
              .set('cookie', cookie)
              .expect('Content-Type', /json/)
              .expect(
                (res) ->
                  return 'user logged in' if res.body.user
              )
              .expect(401)
              .end(done)

  #*---------- SAVE PROFILE ----------*
  describe 'PUT /me/save', ->

    afterEach (done) ->
      utils.revertTestDatabase done

    describe 'on not logged in user', ->
      it 'should refuse changes', (done) ->
        request
        .put('/api/v1/me/save')
        .send({
          name: 'testDummyNameSave'
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in user', ->
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

      describe 'on empty values', ->
        it 'should not make any changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({})
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if !res.body.success
                return 'No success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.username isnt data.users[0].username
                  return "Save failed.
                   Expected username '#{data.users[0].username}'
                   and got '#{res.body.user.username}'"
            )
            .end(done)

      describe 'on invalid values', ->
        it 'should refuse changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({
            name: '      '
          })
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.success
                return 'Success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.name isnt data.users[0].name
                  return "Save failed.
                   Expected name '#{data.users[0].name}'
                   and got '#{res.body.user.name}'"
            )
            .end(done)

      describe 'on valid values', ->
        it 'should save changes', (done) ->
          request
          .put('/api/v1/me/save')
          .send({
            name: 'userDummyNameSave'
          })
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              if res.body.success
                return 'Success'
              if res.body.error
                return 'Error received'
          )
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.name isnt 'userDummyNameSave'
                  return 'Save failed'
            )
            .end(done)

  #*---------- SHOPPING LIST ----------*
  describe 'GET /me/shopping/:action/:recipe', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->

        recipe = data.getBySlug 'recipes', 'test-recipe-1'

        request
        .get('/api/v1/me/shopping/add/' + recipe.slug)
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
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      describe 'on shopping list add a recipe not published', (done) ->
        it 'should response an error', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-banned'

          request
          .get('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(401)
          .end(done)

      describe 'on shopping list add', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/shopping/add/' + recipe.slug)
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
                res.body.recipes.total.must.be.equal 1
                slug = res.body.recipes.results[0].slug
                slug.must.be.equal recipe.slug
            ).end(done)

        it 'should ignore duplicate requests', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            request
            .get('/api/v1/me/shopping/add/' + recipe.slug)
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
                  res.body.recipes.total.must.be.equal 1
                  slug = res.body.recipes.results[0].slug
                  slug.must.be.equal recipe.slug
              )
              .end(done)

        it 'should return error for missing recipe', (done) ->
          request
          .get('/api/v1/me/shopping/add/testDummyRecipe')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on shopping list remove', (done) ->
        it 'should response with success', (done) ->

          recipe = data.getBySlug 'recipes', 'test-recipe-1'

          request
          .get('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            request
            .get('/api/v1/me/shopping/remove/' + recipe.slug)
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
          .get('/api/v1/me/shopping/remove/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done)

        it 'should return error for missing recipe', (done) ->
          request
          .get('/api/v1/me/shopping/remove/testDummyRecipe')
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
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'should paginate properly', (done) ->

        addToShoppingList = (recipe, cb) ->
          request
          .get('/api/v1/me/shopping/add/' + recipe.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(cb)

        recipes = data.getBy 'recipes', 'state', 'published'

        async.each recipes.slice(0, 4), addToShoppingList, ->
          request
          .get('/api/v1/me/shopping/list?page=1&perPage=4')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.recipes.total.must.be.equal 4
              res.body.recipes.results.length.must.be.equal 4
          )
          .end (err, res) ->
            request
            .get('/api/v1/me/shopping/list?page=2&perPage=2')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res2) ->
                res2.body.recipes.total.must.be.equal 4
                res2.body.recipes.results.length.must.be.equal 2
                part = res.body.recipes.results.slice(2,5)
                res2.body.recipes.results.must.be.eql part
            )
            .end(done)

  #*---------- FAVOURITES LIST ----------*
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
            request
            .get('/api/v1/me/favourites/add/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
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
            request
            .get('/api/v1/me/favourites/remove/' + recipe.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
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

        recipes = data.getBy 'recipes', 'state', 'published'

        async.each recipes.slice(0,4), addToShoppingList, ->
          request
          .get('/api/v1/me/favourites/list?page=1&perPage=4')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.recipes.total.must.be.equal 4
              res.body.recipes.results.length.must.be.equal 4
          )
          .end (err, res) ->
            request
            .get('/api/v1/me/favourites/list?page=2&perPage=2')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res2) ->
                res2.body.recipes.total.must.be.equal 4
                res2.body.recipes.results.length.must.be.equal 2
                part = res.body.recipes.results.slice(2,5)
                res2.body.recipes.results.must.be.eql part
            )
            .end(done)
