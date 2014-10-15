must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Tip: View', ->
  describe 'GET /tip/:tip', ->
    describe 'on request with a valid tip state', ->

      slug = 'tip-1'

      it 'return tip', (done) ->
        request
        .get('/tip/' + slug)
        .expect(200)
        .end(done)

    describe 'on request with a draft tip', ->

      slug = 'tip-draft'

      it 'return an error', (done) ->
        request
        .get('/tip/' + slug)
        .expect(404)
        .end(done)