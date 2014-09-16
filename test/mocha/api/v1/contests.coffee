must = require 'must'
keystone = null
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data.json'
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

  describe 'GET /contestsPast', ->
    describe 'on normal request', ->
      it 'paginates properly', (done) ->
        request
        .get('/api/v1/contests/past?page=1&perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.contests.length > 5
              return 'Got unexpected results page'
            # Make our independent sorting and filtering
            contests = data.contests.filter (contest) ->
              contest.state is 'finished'
            contests.sort (a,b) -> return b.programmedDate - a.programmedDate
            contests = contests.slice 0, 5
            # Compare results
            slugsexpected = (c.slug for c in contests)
            slugsgot = (c.slug for c in res.body.contests.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

    describe 'on request without args', ->
      it 'responds with first page, sorted by programmedData', (done) ->
        request
        .get('/api/v1/contests/past?perPage=5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(
          (res) ->
            if res.body.success is false or res.body.error is true
              return 'No arguments query failed'
            if res.body.contests.currentPage != 1
              return 'Got unexpected results page'
            # Make our independent sorting and filtering
            contests = data.contests.filter (contest) ->
              contest.state is 'finished'
            contests.sort (a,b) -> return b.programmedDate - a.programmedDate
            if contests.length > 5
              contests = contests.slice 0, 5
            # Compare results
            console.log('CONTEST', contests)
            console.log('RES CONTEST', res.body.contests.results)

            slugsexpected = (c.slug for c in contests)
            slugsgot = (c.slug for c in res.body.contests.results)
            slugsgot.must.be.eql(slugsexpected)
        )
        .end(done)

