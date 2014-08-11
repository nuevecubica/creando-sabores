must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config.js'
data = require __dirname + '/../data.json'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'PRIVATE RECIPE - SAVE', ->

  before (done) ->
    this.timeout 10000
    request
      .post('/acceso')
      .send({
        'action': 'login'
        'login_email': data.users[0].email
        'login_password': data.users[0].password
      })
      .expect(302)
      .end (err, res) ->
        cookie = res.headers['set-cookie']
        done()

  afterEach (done) ->
    utils.revertTestUsers done

  describe 'GET /receta/:recipe', ->
    it 'responds with the form'

  describe 'POST /perfil/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form'

  describe 'POST /perfil/save', ->
    describe 'on modified data', ->
      it 'updates user profile'
      it 'preserves missing fields'

    describe 'on invalid values', ->
      it 'escapes and removes html'
      it 'truncates long name'
