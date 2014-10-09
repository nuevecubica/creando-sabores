must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'

request = require('supertest') config.keystone.publicUrl

cookie = null

describe.only 'API v1: /contests', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /contests/past', ->

    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/contests/past?page=1&perPage=4')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.contests.results.length.must.be.eql 4
        )
        .end (err, res) ->
          return done(err) if err

          total = res.body.contests.results

          if total.length > 4
            return 'Got unexpected results page'

          request
          .get('/api/v1/contests/past?page=2&perPage=2')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              slugsexpected = (r.slug for r in total).slice(2, 4)
              slugsgot = (r.slug for r in res.body.contests.results)
              slugsgot.must.be.eql(slugsexpected)
          )
          .end(done)

    describe 'on request without args', ->

      it 'responds with first page, sorted by deadline', (done) ->
        request
        .get('/api/v1/contests/past')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            res.body.contests.results.length.must.be.eql 5
        )
        .expect(
          (res) ->
            if res.body.contests.currentPage != 1
              return 'Got unexpected results page'

            past = null
            for contest, i in res.body.contests.results
              if contest.deadline > past
                return "Deadline order failed: #{contest.deadline} > #{past}"
              past = contest.deadline
        )
        .end(done)

