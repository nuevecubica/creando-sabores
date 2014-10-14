must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Question: View', ->
  describe 'GET /question/:question', ->
    describe 'on request with a valid question state', ->

      slug = 'question-1'

      it 'return question', (done) ->
        request
        .get('/pregunta/' + slug)
        .expect(200)
        .end(done)

    describe 'on request with a removed question', ->

      slug = 'question-removed'

      it 'return an error', (done) ->
        request
        .get('/pregunta/' + slug)
        .expect(404)
        .end(done)