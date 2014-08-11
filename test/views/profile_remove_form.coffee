must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config.js'
data = require __dirname + '/../data.json'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'PRIVATE PROFILE - REMOVE', ->

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

  describe 'GET /perfil', ->
    it 'responds with the form', (done) ->
      request
        .get('/perfil')
        .set('cookie', cookie)
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(/perfil\/remove/)
        .end(done)

  describe 'POST /perfil/remove', ->
    describe 'on remove request', ->
      it 'should destroy user session', (done) ->
        request
          .post('/perfil/remove')
          .set('cookie', cookie)
          .send({})
          .expect(302)
          .expect(
            (res) ->
              if res.header['location'] isnt '/' or
                  res.header['api-response-success'] isnt 'Profile removed' or
                  res.header['api-response-error'] isnt 'false'
                return 'Wrong status headers'
          )
          .end (err, res) ->
            if err
              return done err, res
            request
              .get('/api/v1/me')
              .set('Accept', 'application/json')
              .set('cookie', res.headers['set-cookie'])
              .expect('Content-Type', /json/)
              .expect(401)
              .expect(
                (res) ->
                  return 'user logged in' if res.body.user
              )
              .end(done)
