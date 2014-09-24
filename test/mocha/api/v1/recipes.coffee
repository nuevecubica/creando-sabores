must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /recipes', ->

  before (done) ->
    this.timeout 5000
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

            res.body.recipes.results.length.must.be.lte 5
            past = 5
            for recipe, i in res.body.recipes.results
              if recipe.rating > past
                return "Rating order failed: #{recipe.rating} > #{past}"
              past = recipe.rating
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/recipes?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.recipes.results.length.must.be.eql 4
        )
        .end (err, res) ->
          total = res.body.recipes.results

          request
          .get('/api/v1/recipes?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
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

            res.body.recipes.results.length.must.be.gte 2
            past = null
            user = data.getUserByUsername 'testUser1'
            for recipe, i in res.body.recipes.results
              if recipe.author isnt user._id
                return "Wrong username: #{recipe.author}"
              if past && recipe.editDate > past
                return "editDate order failed: #{recipe.editDate} > #{past}"
              past = recipe.editDate
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/user/testUser1/recipes?page=1&perPage=2')
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
          .get('/api/v1/user/testUser1/recipes?page=2&perPage=1')
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
        .get('/api/v1/me/recipes?perPage=20')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'Unexpected status values'

            res.body.recipes.results.length.must.be.lte 20

            user = data.getUserByUsername 'testUser1'
            banOrDraft = false
            for recipe in res.body.recipes.results
              if recipe.author isnt user._id
                return "Wrong username: #{recipe.author}"
              if ['draft', 'banned', 'review'].indexOf(recipe.state) >= 0
                banOrDraft = true
                break

            if not banOrDraft
              return 'No private recipes found. Test unsuccesful?'
        )
        .end(done)

      it 'paginates properly', (done) ->
        request
        .get('/api/v1/me/recipes?page=1&perPage=4')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.recipes.results.length.must.be.eql 4
        )
        .end (err, res) ->

          total = res.body.recipes.results

          request
          .get('/api/v1/me/recipes?page=2&perPage=2')
          .set('Accept', 'application/json')
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total.slice(2, 4))
              slugsgot = (r.slug for r in res.body.recipes.results)
              slugsgot.must.be.eql slugsexpected
          )
          .end(done)

  describe 'PUT /api/v1/recipe/:recipe/like', ->

    describe 'if recipe does not have a valid state', ->

      recipe = data.getBySlug 'recipes', 'test-recipe-banned'

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

    describe 'and recipe contest does not have a valid state', ->

      recipe = data.getBySlug 'recipes', 'test-contest-closed-recipe'

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

    describe 'and recipe does not have a vote from the user', ->

      recipe = data.getBySlug 'recipes', 'test-contest-recipe-no-likes'
      recipeVotedId = null
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
            recipeVotedId = res.body.id
            done()

      it 'adds one to the recipe\'s like counter', (done) ->
        recipeLikes.must.be.eql 1
        done()

      it 'adds the recipe to the user\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          isLiked = 0
          for like in res.body.user.likes
            if like is recipeVotedId
              ++isLiked
              break

          if not isLiked
            return "It's not on the list"

          if isLiked > 1
            return "Recipe duplicated"

          done()

    describe 'if recipe has a vote from the user already', ->

      recipe = data.getBySlug 'recipes', 'test-contest-recipe-liked'
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
        .end (err, res) ->
          res.body.likes.must.be.eql(recipeLikes)
          done()

      it 'keeps the users\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
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
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              userLikesFirst.must.be.eql res.body.user.likes
              done()

    describe 'if it comes from an invalid referer', ->

      recipe = data.getBySlug 'recipes', 'test-contest-recipe-no-likes'

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
      @timeout 5000

      recipe = data.getBySlug 'recipes', 'test-contest-recipe-no-likes'
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
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'keeps the recipe\'s like count', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/unlike')
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect (res) ->
          if (recipe.likes || 0) isnt res.body.likes
            return "Different like count: #{recipe.likes} <> #{res.body.likes}"
        .end(done)

      it 'keeps the users\'s `likes` list', (done) ->
        request
        .get('/api/v1/me')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->

          origLikes = res.body.user.likes

          request
          .put('/api/v1/recipe/' + recipe.slug + '/unlike')
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect (res) ->
              res.body.user.likes.must.be.eql origLikes
            .end done

    describe 'if recipe has a vote from the user', ->
      recipe = data.getBySlug 'recipes', 'test-contest-recipe-liked'
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
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            recipeLikes = res.body.likes
            recipeVoted = res.body.id
            done()

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
        .end (err, res) ->
          userLikesFirst = res.body.user.likes

          request
          .put('/api/v1/recipe/' + recipe.slug + '/unlike')
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              length = res.body.user.likes.length
              length.must.be.eql(userLikesFirst.length - 1)
              res.body.user.likes.must.not.include userLikesFirst
              done()

    describe 'if it comes from an invalid referer', ->
      recipe = recipe = data.getBySlug 'recipes', 'test-contest-recipe-liked'

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

      it 'ignores this call', (done) ->
        request
        .put('/api/v1/recipe/' + recipe.slug + '/unlike')
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)



  describe 'PUT /api/v1/recipe/:recipe/vote/:score', ->

    recipeGood = 'test-recipe-1'
    recipeContest = 'test-contest-recipe-1'
    recipeMiss = 'dummy-recipe-slug'

    describe 'if not logged in', ->
      it 'returns an error', (done) ->
        request
        .put('/api/v1/recipe/' + recipeGood + '/vote/5')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeGood)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'if logged in', ->
      this.timeout 10000

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

      describe 'on missing recipe', ->
        it 'returns an error', (done) ->
          request
          .put('/api/v1/recipe/' + recipeMiss + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeMiss)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on contest recipe', ->
        it 'returns an error', (done) ->
          request
          .put('/api/v1/recipe/' + recipeContest + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeContest)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

      describe 'on valid recipe', ->
        it 'rejects invalid scores', (done) ->
          request
          .put('/api/v1/recipe/' + recipeGood + '/vote/6')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

        it 'counts correctly the vote', (done) ->
          request
          .put('/api/v1/recipe/' + recipeGood + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            done()

        it 'updates the rating if voted before', (done) ->
          request
          .put('/api/v1/recipe/' + recipeGood + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/receta/' + recipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            request
            .put('/api/v1/recipe/' + recipeGood + '/vote/3')
            .set('Accept', 'application/json')
            .set('Referer',
                 config.keystone.publicUrl + '/receta/' + recipeGood)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              res.body.rating.must.be.equal 3
              done()
