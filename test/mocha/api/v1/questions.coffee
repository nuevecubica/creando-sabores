must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe.only 'API v1: /questions', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /questions', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by rating', (done) ->
        request
        .get('/api/v1/questions?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.questions.currentPage != 1
              return 'Got unexpected results page'

            res.body.questions.results.length.must.be.lte 5
            past = 5
            for recipe, i in res.body.questions.results
              if recipe.rating > past
                return "Question failed: #{questions.publishedDate} > #{past}"
              past = recipe.rating
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/questions?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.questions.results.length.must.be.eql 4
        )
        .end (err, res) ->
          total = res.body.questions.results

          request
          .get('/api/v1/questions?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.questions.results)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

    describe 'on request form admin user', ->

      question = data.getBySlug 'questions', 'question-review'

      before (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.admins[0].email,
          password: data.admins[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

      it 'responds with all recipes (in review and removed states)', (done) ->
        request
        .get('/api/v1/questions?page=1&perPage=1')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            questions = res.body.questions.results

            questions[0].slug.must.be.eql question.slug
        )
        .end(done)

    describe 'on request form user (no admin)', ->

      question = data.getBySlug 'questions', 'question-closed'

      before (done) ->
        #utils.login <------ UTILIZAR FUNCION
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

      it 'responds with publised and closed recipes', (done) ->
        request
        .get('/api/v1/questions?page=1&perPage=1')
        .set('Accept', 'application/json')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            questions = res.body.questions.results
            questions[0].slug.must.be.eql question.slug
        )
        .end(done)

