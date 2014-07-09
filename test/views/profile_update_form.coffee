must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config-test.js'
utils = require __dirname + '/../utils.js'


request = require('supertest') config.url
cookie = null

describe 'PRIVATE PROFILE - CHANGE', ->
  
  before (done) ->
    this.timeout 10000
    request
      .post('/acceso')
      .send({
        'action': 'login'
        'login_email': config.lists.users[0].email
        'login_password': config.lists.users[0].password
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
      .expect(/username/)
      .expect(/email/)
      .expect(/old-pass/)
      .expect(/new-pass/)
      .expect(/isPrivate/)
      .end(done)

  describe 'POST /perfil/change', ->
    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end(done)
          
    describe 'on modified data', ->
      it 'updates user data', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': 'demo-username',
          'email': 'demo@email.com'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.username isnt 'demo-username' or
                    res.body.user.email isnt 'demo@email.com'
                  return 'Edit failed'
            )
            .end(done)

      it 'preserves missing fields', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': config.lists.users[0].username
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt config.lists.users[0].email
                  return 'Edit changed unmodified fields'
            )
            .end(done)

      it 'changes the password', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'old-pass': config.lists.users[0].password,
          'new-pass': 'demo-pass'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .post('/api/v1/login')
            .send({
              email: config.lists.users[0].email,
              password: 'demo-pass'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done)

    describe 'on invalid values', ->
      it 'rejects repeated username', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'username': config.lists.users[1].username
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.username isnt config.lists.users[0].username
                  return 'Username changed on collision'
            )
            .end(done)

      it 'rejects repeated email', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'email': config.lists.users[1].email
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .get('/api/v1/me')
            .set('Accept', 'application/json')
            .set('cookie', cookie)
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                if res.body.user.email isnt config.lists.users[0].email
                  return 'Email changed on collision'
            )
            .end(done)

      it 'rejects bad password', (done) ->
        request
        .post('/perfil/change')
        .set('cookie', cookie)
        .send({
          'old-pass': 'bad-password',
          'new-pass': 'demo-password'
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end (err, res) ->
          request
            .post('/api/v1/login')
            .send({
              email: config.lists.users[0].email,
              password: config.lists.users[0].password
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(done)
