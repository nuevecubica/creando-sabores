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