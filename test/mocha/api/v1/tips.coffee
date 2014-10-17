must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: tips', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /api/v1/tips/recent', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by rating', (done) ->
        request
        .get('/api/v1/tips/recent?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.tips.currentPage != 1
              return 'Got unexpected results page'

            res.body.tips.results.length.must.be.lte 5
            past = new Date()
            for tip, i in res.body.tips.results
              if tip.publishedDate > past
                return "Tip failed: #{tips.publishedDate} > #{past}"
              past = tip.publishedDate
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/tips/recent?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.tips.results.length.must.be.eql 4
        )
        .end (err, res) ->
          total = res.body.tips.results

          request
          .get('/api/v1/tips/recent?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.tips.results)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

  describe 'GET /api/v1/tips/popular', ->
    describe 'on request without args', ->
      it 'responds with first page, sorted by rating', (done) ->
        request
        .get('/api/v1/tips/popular?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'
            if res.body.tips.currentPage != 1
              return 'Got unexpected results page'

            res.body.tips.results.length.must.be.lte 5
            past = 5
            for tip, i in res.body.tips.results
              if tip.rating > past
                return "Tip failed: #{tip.rating} > #{past}"
              past = tip.rating
        )
        .end(done)

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/tips/popular?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.tips.results.length.must.be.eql 4
        )
        .end (err, res) ->
          total = res.body.tips.results

          request
          .get('/api/v1/tips/popular?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.tips.results)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

  describe 'PUT /api/v1/tip/:tip/vote/:score', ->

    tip = 'tip-1'
    tipWithoutScore = 'tip-4'
    dummy = 'dummy-tip-slug'

    describe 'if not logged in', ->
      it 'returns an error', (done) ->
        request
        .put('/api/v1/tip/' + tip + '/vote/5')
        .set('Accept', 'application/json')
        .set('Referer',
            config.keystone.publicUrl + '/tip/' + tip)
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

      describe 'on missing tip', ->
        it 'returns an error', (done) ->
          request
          .put('/api/v1/tip/' + dummy + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/tip/' + dummy)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on valid tip', ->
        it 'rejects invalid scores', (done) ->
          request
          .put('/api/v1/tip/' + tip + '/vote/6')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/tip/' + tip)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(403)
          .end(done)

        it 'counts correctly the vote', (done) ->
          request
          .put('/api/v1/tip/' + tipWithoutScore + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/tip/' + tip)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            done()

        it 'updates the rating if voted before', (done) ->
          request
          .put('/api/v1/tip/' + tipWithoutScore + '/vote/5')
          .set('Accept', 'application/json')
          .set('Referer',
            config.keystone.publicUrl + '/tip/' + tip)
          .set('cookie', cookie)
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            res.body.rating.must.be.equal 5
            request
            .put('/api/v1/tip/' + tipWithoutScore + '/vote/3')
            .set('Accept', 'application/json')
            .set('Referer',
                 config.keystone.publicUrl + '/tip/' + tip)
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              res.body.rating.must.be.equal 3
              done()

    describe 'if it comes from an invalid referer', ->

      tip = 'tip-1'

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
        .put('/api/v1/tip/' + tip + '/vote/5')
        .set('Accept', 'application/json')
        .set('Referer', 'http://random.url.com')
        .set('cookie', cookie)
        .expect('Content-Type', /json/)
        .expect(403)
        .end(done)
