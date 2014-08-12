must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config.js'
data = require __dirname + '/../data.json'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'PRIVATE RECIPE - SAVE', ->

  beforeEach (done) ->
    this.timeout 10000
    utils.loginUser data.users[0], request, (err, res) ->
      cookie = res.headers['set-cookie']
      done()

  afterEach (done) ->
    utils.revertTestUsers done

  describe 'GET /receta/:recipe', ->
    describe 'from author', ->
      it 'responds with the form'
    describe 'from another user', ->
      it 'doesn\'t respond with the form'

  describe 'POST /receta/:recipe/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form'

    describe 'on modified data', ->
      it 'updates user profile'
      it 'preserves missing fields'

    describe 'on invalid values', ->
      it 'escapes and removes html'
      it 'truncates long name'
