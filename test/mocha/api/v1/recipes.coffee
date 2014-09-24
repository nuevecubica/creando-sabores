must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
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
            recipes = data.db.recipes.filter (recipe) ->
              recipe.state is 'published'
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
            recipes = data.db.recipes.filter (recipe) ->
              recipe.state is 'published'
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
            recipes = data.db.recipes.filter (recipe) ->
              recipe.state is 'published'
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
            recipes = data.db.recipes.filter (recipe) ->
              recipe.state is 'published' and recipe.author is 1
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
            recipes = data.db.recipes.filter (recipe) -> recipe.author is 1
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
            recipes = data.db.recipes.filter (recipe) -> recipe.author is 1
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            recipes = recipes.slice 2, 4
            # Compare results
            slugsexpected = (r.slug for r in recipes)
            slugsgot = (r.slug for r in res.body.recipes.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

  describe 'PUT /api/v1/recipe/:recipe/like', ->

    describe 'if recipe does not have a valid state', ->

      recipe = data.db.recipes[4]

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']
            done()
        )

      it 'ignores this call', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/like')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/recipe/' + recipe.slug + '/like')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)

    describe 'if recipe contest does not have a valid state', ->

      recipe = data.db.recipes[10]

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']
            done()
        )

      it 'ignores this call', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/like')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/recipe/' + recipe.slug + '/like')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)

    describe 'if recipe does not have a vote from the user', ->

      recipe = data.db.recipes[6]
      recipeVoted = null
      recipeLikes = recipe.likes || 0

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

          request
          .put('/api/v1/recipe/' + recipe.slug + '/like')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl +
            '/api/v1/recipe/' + recipe.slug + '/like')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            recipeLikes = res.body.likes
            recipeVoted = res.body.id
            done()

      it 'adds one to the recipe\'s like counter', (done) ->
        recipeLikes.must.be.eql(1)
        done()

      it 'adds the recipe to the user\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          length = res.body.user.likes.length
          length.must.be.eql(1)
          res.body.user.likes[length - 1].must.be.eql(recipeVoted)
          done()

    describe 'if recipe has a vote from the user already', ->

      recipe = data.db.recipes[6]
      recipeVoted = null
      recipeLikes = recipe.likes || 0

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']

            request
            .put('/api/v1/recipe/' + recipe.slug + '/like')
            .set('Accept', 'application/json')
            .set('Referer',
              config.keystone.publicUrl +
              '/api/v1/recipe/' + recipe.slug + '/like')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                recipeLikes = res.body.likes
                recipeVoted = res.body.id
                done()
            )
        )

      it 'keeps the recipe\'s like count', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/like')
        .set('Accept', 'application/json')
        .set('Referer',
          config.keystone.publicUrl +
          '/api/v1/recipe/' + recipe.slug + '/like')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            res.body.likes.must.be.eql(recipeLikes)
            done()
        )


      it 'keeps the users\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            userLikesFirst = res.body.user.likes
            request
            .put('/api/v1/recipe/' + recipe.slug + '/like')
            .set('Accept', 'application/json')
            .set('Referer',
              config.keystone.publicUrl +
              '/api/v1/recipe/' + recipe.slug + '/like')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                request
                .get('/api/v1/me')
                .set('Accept', 'application/json')
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(
                  (err, res) ->
                    userLikesFirst.must.be.eql(res.body.user.likes)
                    done()
                )
            )
        )

    describe 'if it comes from an invalid referer', ->

      recipe = data.db.recipes[6]

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']
            done()
        )

      it 'ignores this call', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/like')
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)


  describe 'PUT /recipe/:recipe/unlike', ->

    describe 'if recipe does not have a vote from the user', ->
      @timeout 20000

      recipe = data.db.recipes[6]
      user0 = data.users[0]
      user1 = data.users[1]

      beforeEach (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: user0.email,
          password: user0.password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']
            done()
        )

      it 'keeps the recipe\'s like count', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/like')
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            recipeLikes = res.body.likes

            request
            .get('/api/v1/me/logout')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                cookie = res.headers['set-cookie']
                return 'error' if not res.body.success or res.body.error

                request
                .post('/api/v1/login')
                .send({
                  email: user1.email,
                  password: user1.password
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(
                  (err, res) ->
                    return 'error' if not res.body.success or res.body.error
                    cookie = res.headers['set-cookie']

                    request
                    .put('/api/v1/recipe/' + recipe.slug + '/unlike')
                    .set('Accept', 'application/json')
                    .set('Referer', config.keystone.publicUrl)
                    .set('cookie', cookie)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .expect(
                      (res) ->
                        res.body.likes.must.be.eql(recipeLikes)
                    )
                    .end(done)
                )
            )
        )


      it 'keeps the users\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            userLikesFirst = res.body.user.likes

            request
            .put('/api/v1/recipe/' + recipe.slug + '/unlike')
            .set('Accept', 'application/json')
            .set('Referer', config.keystone.publicUrl)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                request
                .get('/api/v1/me')
                .set('Accept', 'application/json')
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(
                  (err, res) ->
                    res.body.user.likes.must.be.eql(userLikesFirst)
                    done()
                )
            )
        )

    describe 'if recipe has a vote from the user', ->
      recipe = data.db.recipes[6]
      recipeVoted = null
      recipeLikes = recipe.likes || 0

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']

            request
            .put('/api/v1/recipe/' + recipe.slug + '/like')
            .set('Accept', 'application/json')
            .set('Referer', config.keystone.publicUrl)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                recipeLikes = res.body.likes
                recipeVoted = res.body.id
                done()
            )
        )

      it 'substracts one from the recipe\'s like counter', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/unlike')
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.likes.must.be.eql(recipeLikes - 1)
        )
        .end(done)

      it 'takes away the recipe from the user\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(
          (err, res) ->
            userLikesFirst = res.body.user.likes

            request
            .put('/api/v1/recipe/' + recipe.slug + '/unlike')
            .set('Accept', 'application/json')
            .set('Referer', config.keystone.publicUrl)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(
              (err, res) ->
                request
                .get('/api/v1/me')
                .set('Accept', 'application/json')
                .set('cookie', cookie)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(
                  (err, res) ->
                    length = res.body.user.likes.length
                    length.must.be.eql(userLikesFirst.length - 1)
                    res.body.user.likes.must.not.include(userLikesFirst)
                    done()
                )
            )
        )

    describe 'if it comes from an invalid referer', ->
      recipe = data.db.recipes[6]

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
        .end(
          (err, res) ->
            return 'error' if not res.body.success or res.body.error
            cookie = res.headers['set-cookie']
            done()
        )

      it 'ignores this call', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/unlike')
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)
