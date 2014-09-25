must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /videorecipes', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /videorecipes', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by edit date', (done) ->
        request
        .get('/api/v1/videorecipes?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.videorecipes.currentPage != 1
              return 'Got unexpected results page'

            res.body.videorecipes.results.length.must.be.gte 2
            past = null
            for videorecipe, i in res.body.videorecipes.results
              if past && videorecipe.editDate > past
                return "editDate order failed: #{videorecipe.editDate} > #{past}"
              past = videorecipe.editDate
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/videorecipes?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.videorecipes.results.length.must.be.eql 4
        )
        .end (err, res) ->
          total = res.body.videorecipes.results

          request
          .get('/api/v1/videorecipes?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.videorecipes.results)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

  describe 'PUT /api/v1/videorecipe/:videorecipe/like', ->
    it 'returns an error', (done) ->
      request
      .put('/api/v1/videorecipe/' + videorecipe.slug + '/like')
      .set('Accept', 'application/json')
      .set('Referer',
          config.keystone.publicUrl +
          '/api/v1/videorecipe/' + videorecipe.slug + '/like')
      .set('cookie', cookie)
      .expect('Content-Type', /json/)
      .expect(401)
      .end(done)

  describe 'PUT /api/v1/videorecipe/:videorecipe/vote/:score', ->

    videorecipeGood = 'test-videorecipe-1'
    videorecipeContest = 'test-contest-videorecipe-no-likes'
    videorecipeMiss = 'dummy-videorecipe-slug'

    describe 'if not logged in', ->
      it 'returns an error', (done) ->
        request
        .put('/api/v1/videorecipe/' + videorecipeGood + '/vote/5')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeGood)
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

      describe 'on missing videorecipe', ->
        it 'returns an error', (done) ->
          request
          .put('/api/v1/videorecipe/' + videorecipeMiss + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeMiss)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on contest videorecipe', ->
        it 'returns an error', (done) ->
          request
          .put('/api/v1/videorecipe/' + videorecipeContest + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeContest)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

      describe 'on valid videorecipe', ->
        it 'rejects invalid scores', (done) ->
          request
          .put('/api/v1/videorecipe/' + videorecipeGood + '/vote/6')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

        it 'counts correctly the vote', (done) ->
          request
          .put('/api/v1/videorecipe/' + videorecipeGood + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            done()

        it 'updates the rating if voted before', (done) ->
          request
          .put('/api/v1/videorecipe/' + videorecipeGood + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/videoreceta/' + videorecipeGood)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            request
            .put('/api/v1/videorecipe/' + videorecipeGood + '/vote/3')
            .set('Accept', 'application/json')
            .set('Referer',
                 config.keystone.publicUrl + '/videoreceta/' + videorecipeGood)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              res.body.rating.must.be.equal 3
              done()
