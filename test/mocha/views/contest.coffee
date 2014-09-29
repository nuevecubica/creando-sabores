must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Contest', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get /concurso/:contest', ->
    describe 'on draft', ->
      it 'returns not found', (done) ->
        request
        .get('/concurso/test-contest-draft')
        .expect(404)
        .end(done)

    describe 'on programmed', ->
      it 'returns the contest', (done) ->
        request
        .get('/concurso/test-contest-programmed')
        .expect(200)
        .end(done)

    describe 'on submission', ->
      it 'returns the contest', (done) ->
        request
        .get('/concurso/test-contest-submission')
        .expect(200)
        .end(done)

    describe 'on votes', ->
      it 'returns the contest', (done) ->
        request
        .get('/concurso/test-contest-votes')
        .expect(200)
        .end(done)

    describe 'on closed', ->
      it 'returns the contest', (done) ->
        request
        .get('/concurso/test-contest-closed')
        .expect(200)
        .end(done)

    describe 'on finished', ->
      it 'returns the contest', (done) ->
        request
        .get('/concurso/test-contest-finished')
        .expect(200)
        .end(done)

    describe 'on overdue programmed visit', ->
      it 'changes it to submission', (done) ->
        request
        .get('/concurso/test-contest-overdue-programmed')
        .expect(200)
        .expect(/status-tag submission/)
        .end(done)

    describe 'on overdue submission visit', ->
      it 'changes it to votes', (done) ->
        request
        .get('/concurso/test-contest-overdue-submission')
        .expect(200)
        .expect(/status-tag votes/)
        .end(done)

    describe 'on overdue votes visit', ->
      it 'changes it to closed', (done) ->
        request
        .get('/concurso/test-contest-overdue-votes')
        .expect(200)
        .expect(/status-tag closed/)
        .end(done)

    describe 'on overdue contests list visit', ->
      it 'updates them and returns the new promoted one'