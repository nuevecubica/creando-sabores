must = require 'must'
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'
async = require 'async'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

describe 'API v1: /me/recipes', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

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
            if res.body.success or not res.body.error
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
          return done(err) if err

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

            user = data.getUserByUsername 'testuser1'
            banOrDraft = false
            for recipe in res.body.recipes.results
              if recipe.author.username isnt user.username
                return "Wrong username: #{recipe.author.username}"
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
          return done(err) if err

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
