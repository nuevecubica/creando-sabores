must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Forgotten password:', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get url', ->
    it 'responds with the form', (done) ->
      request
      .get('/contrasena-olvidada')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/password-retrieval/)
      .expect(/forgotten-password/)
      .expect(/email/)
      .expect(/submit/)
      .end(done)

  describe 'submit an email', ->

    describe 'empty', ->
      it 'shows an error flash message', (done) ->
        request
        .post('/contrasena-olvidada')
        .send({
          action: 'forgotten-password'
        })
        .expect(200)
        .expect(
          (res) ->
            if res.header['api-response-error'] is 'false'
              return 'Wrong status headers.' +
              ' Success: ' + res.header['api-response-success'] +
              ' / Error: ' + res.header['api-response-error']
        )
        .expect(/ui message error-here error/)
        .end(done)

    describe 'invalid', ->
      it 'shows an error flash message', (done) ->
        request
        .post('/contrasena-olvidada')
        .send({
          action: 'forgotten-password'
          email: 'test-dummy-email-1234@glue.gl'
        })
        .expect(200)
        .expect(
          (res) ->
            if res.header['api-response-error'] is 'false'
              return 'Wrong status headers.' +
              ' Success: ' + res.header['api-response-success'] +
              ' / Error: ' + res.header['api-response-error']
        )
        .expect(/ui message error-here error/)
        .end(done)

    describe 'valid', ->
      it 'redirects to access', (done) ->
        request
        .post('/contrasena-olvidada')
        .send({
          action: 'forgotten-password'
          email: 'testUser1@glue.gl'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/acceso' and
                res.header['api-response-success'] isnt 'true'
              return 'Wrong status headers.' +
              ' Success: ' + res.header['api-response-success'] +
              ' / Error: ' + res.header['api-response-error']
        )
        .end(done)
