must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null
cookieInvalid = null
cookieAdmin = null

describe 'API v1: questions', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase (err) ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          utils.loginUser data.users[3], request, (err, res) ->
            cookieInvalid = res.headers['set-cookie']
            utils.loginUser data.admins[0], request, (err, res) ->
              cookieAdmin = res.headers['set-cookie']
              done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /api/v1/questions', ->
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
            past = new Date()
            for question, i in res.body.questions.results
              if question.publishedDate > past
                return "Question failed: #{questions.publishedDate} > #{past}"
              past = question.publishedDate
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
          return done(err) if err

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

    describe 'on request from admin user', ->
      question = data.getBySlug 'questions', 'question-review'

      it 'responds with all questions (in review and removed states)', (done) ->
        request
        .get('/api/v1/questions?page=1&perPage=1')
        .set('Accept', 'application/json')
        .set('cookie', cookieAdmin)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            questions = res.body.questions.results

            questions[0].slug.must.be.eql question.slug
        )
        .end(done)

    describe 'on request form user (no admin)', ->
      question = data.getBySlug 'questions', 'question-1'

      it 'responds with publised and closed questions', (done) ->
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

  #change put
  describe 'POST /api/v1/question/add', ->
    title = 'Random question for random users in random world at random time.'

    describe 'add question from user with a valid state', ->

      describe 'on normal request', ->
        it 'adds question', (done) ->
          request
          .post('/api/v1/question/add')
          .send({
            title: title
          })
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect (res) ->
            res.body.success.must.be.eql true
            res.body.question.title.must.be.eql title
          .end(done)

      describe 'on request without params', ->
        it 'responds status error', (done) ->
          request
          .post('/api/v1/question/add')
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

    describe 'add question from user without valid state (banned/confirmed)', ->

      it 'responds unauthorized error', (done) ->
        request
        .post('/api/v1/question/add')
        .send({
          title: title
        })
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookieInvalid)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'if it comes from an invalid referer', ->

      it 'ignores this call', (done) ->
        request
        .post('/api/v1/question/add')
        .send({
          title: title
        })
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)

  describe 'PUT /api/v1/question/:question/:state', ->
    question = data.getBySlug 'questions', 'question-review'
    state = 'published'

    describe 'change state from admin user', ->

      describe 'publish question', ->
        it 'change question state to published', (done) ->
          request
          .put('/api/v1/question/' + question.slug + '/' + state)
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookieAdmin)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect (res) ->
            res.body.success.must.be.eql true
            res.body.error.must.be.eql false
            res.body.state.must.be.eql state
          .end(done)

      describe 'publish question without answer', ->
        questionNoAns = data.getBySlug 'questions', 'question-without-answer'

        it 'responds status error', (done) ->
          request
          .put('/api/v1/question/' + questionNoAns.slug + '/' + state)
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookieAdmin)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect (res) ->
            res.body.success.must.be.eql false
            res.body.error.must.be.eql true
          .end(done)

      describe 'if it comes from an invalid referer', ->
        it 'ignores this call', (done) ->
          request
          .put('/api/v1/question/' + question.slug + '/' + state)
          .set('Accept', 'application/json')
          .set('Referer', 'http://random.url.com')
          .set('cookie', cookieAdmin)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

    describe 'change state from user (no admin)', ->
      it 'responds unauthorized error', (done) ->
        request
        .put('/api/v1/question/' + question.slug + '/' + state)
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'change state from user without valid state (banned/confirmed)', ->
      it 'responds unauthorized error', (done) ->
        request
        .put('/api/v1/question/' + question.slug + '/' + state)
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookieInvalid)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)
