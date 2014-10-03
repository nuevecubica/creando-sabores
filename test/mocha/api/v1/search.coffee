must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe 'API v1: /search', ->

  before (done) ->
    this.timeout 5000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /search', ->
    describe 'on request with query', ->
      it 'returns a list', (done) ->
        request
        .get('/api/v1/search?q=test')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt true or res.body.error isnt false
              return 'No arguments query failed'

            res.body.results.hits.hits.length.must.be.gt 1
            res.body.results.hits.hits.length.must.be.lte 10
        )
        .end(done)

      it 'paginates properly', (done) ->
        request
        .get('/api/v1/search?q=test&page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.results.hits.hits.length.must.be.eql 4
        )
        .end (err, res) ->
          if err
            return done(err)

          total = res.body.results.hits.hits

          request
          .get('/api/v1/search?q=test&page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.results.hits.hits)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

    describe 'on request without query', ->
      it 'returns an error', (done) ->
        request
        .get('/api/v1/search')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success isnt false or res.body.error isnt true
              return 'No query failed'
        )
        .end(done)