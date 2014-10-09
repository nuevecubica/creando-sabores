must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: questions', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

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

      it 'responds with all questions (in review and removed states)', (done) ->
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
      beforeEach (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.users[3].email,
          password: data.users[3].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error

          cookie = res.headers['set-cookie']
          done()

      it 'responds unauthorized error', (done) ->
        request
        .post('/api/v1/question/add')
        .send({
          title: title,
        })
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'if it comes from an invalid referer', ->

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
        .post('/api/v1/question/add')
        .send({
          title: title,
        })
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)

  describe 'POST /api/v1/question/:question/:state', ->
    describe 'change state from admin user', ->

      beforeEach (done) ->
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

      describe 'publish question', ->

        question = data.getBySlug 'questions', 'question-review'
        state = 'published'

        it 'change question state to published', (done) ->
          request
          .get('/api/v1/question/' + question.slug + '/' + state)
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect (res) ->
            res.body.success.must.be.eql true
            res.body.error.must.be.eql false
            res.body.state.must.be.eql state
          .end(done)

      describe 'publish question without answer', ->

        question = data.getBySlug 'questions', 'question-without-answer'
        state = 'published'

        it 'responds status error', (done) ->
          request
          .get('/api/v1/question/' + question.slug + '/' + state)
          .set('Accept', 'application/json')
          .set('Referer', config.keystone.publicUrl)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .expect (res) ->
            res.body.success.must.be.eql false
            res.body.error.must.be.eql true
          .end(done)

    describe 'change state from user (no admin)', ->
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

      question = data.getBySlug 'questions', 'question-review'
      state = 'published'

      it 'responds unauthorized error', (done) ->
        request
        .get('/api/v1/question/' + question.slug + '/' + state)
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'change state from user without valid state (banned/confirmed)', ->
      beforeEach (done) ->
        request
        .post('/api/v1/login')
        .send({
          email: data.users[3].email,
          password: data.users[3].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return 'error' if not res.body.success or res.body.error

          cookie = res.headers['set-cookie']
          done()

      question = data.getBySlug 'questions', 'question-review'
      state = 'published'

      it 'responds unauthorized error', (done) ->
        request
        .get('/api/v1/question/' + question.slug + '/' + state)
        .set('Accept', 'application/json')
        .set('Referer', config.keystone.publicUrl)
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'if it comes from an invalid referer', ->

      beforeEach (done) ->
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

      question = data.getBySlug 'questions', 'question-review'
      state = 'published'

      it 'ignores this call', (done) ->
        request
        .get('/api/v1/question/' + question.slug + '/' + state)
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)





