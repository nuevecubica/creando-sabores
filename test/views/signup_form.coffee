must = require 'must'
keystone = null
config = require __dirname + '/../../config-test.js'

request = require('supertest') config.url

describe 'API v1: /user', ->
  before (done) ->
    this.timeout 10000

    keystone = require __dirname + '/../../app-test-init.js'

    Users = keystone.list 'User'
    for user in config.lists.users
      userM = new Users.model()
      userM.name     = user.name
      userM.username = user.username
      userM.email    = user.email
      userM.password = user.password
      userM.save()

    request.get('/').expect 200, done

  describe 'GET /registro', ->
    it 'responds with the form', (done) ->
      request
      .get('/registro')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(/Nombre de usuario/)
      .expect(/Correo electrónico/, done)

  describe 'POST /registro', ->
    describe 'on send empty data', ->
      it 'responds with error', (done) ->
        request
        .post('/registro')
        .send({
          'signup_name': ''
          'signup_email': ''
          'signup_password': ''
        })
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/Missing data/, done)

  describe 'POST /registro', ->
    describe 'on send incomplete data', ->
      it 'responds with error', (done) ->
        request
        .post('/registro')
        .send({
          'signup_name': 'blablabla'
          'signup_email': 'blablabla'
          'signup_password': ''
        })
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/Missing data/, done)
