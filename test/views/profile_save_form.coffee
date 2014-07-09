must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config-test.js'
utils = require __dirname + '/../utils.js'


request = require('supertest') config.url
cookie = null

describe 'PRIVATE PROFILE', ->
  
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
      .expect(/profile-about/)
      .expect(/profile-name/)
      .expect(/profile-img-select/)
      .expect(/profile-header-select/)
      .end(done)

  describe 'POST /perfil/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/perfil/save')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/perfil'
              return 'Redirection failed'
        )
        .end(done)
          
  describe 'POST /perfil/save', ->
    describe 'on modified data', ->
      it 'updates user profile', (done) ->
        # This doesn't check the image upload.
        request
        .post('/perfil/save')
        .set('cookie', cookie)
        .send({
          'about': 'demo-about',
          'name': 'demo-name'
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
                if res.body.user.about isnt '<p>demo-about</p>' or
                    res.body.user.name isnt 'demo-name'
                  return 'Edit failed'
            )
            .end(done)

      it 'preserves missing fields', (done) ->
        request
        .post('/perfil/save')
        .set('cookie', cookie)
        .send({
          'about': 'demo-about'
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
                if res.body.user.about isnt '<p>demo-about</p>'
                  return 'Edit failed'
                if res.body.user.name isnt config.lists.users[0].name
                  return 'Edit changed unmodified fields'
            )
            .end(done)


  describe 'POST /perfil/save', ->
    describe 'on invalid values', ->
      it 'escapes and removes html', (done) ->
        # This doesn't check the image upload.
        request
        .post('/perfil/save')
        .set('cookie', cookie)
        .send({
          'about': '12<html>34&56',
          'name': '12<html>34&56'
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
                if res.body.user.about isnt '<p>12&lt;html&gt;34&amp;56</p>' or
                    res.body.user.name isnt '1234&amp;56'
                  console.log(res.body.user.about)
                  console.log(res.body.user.name)
                  return 'HTML escape failed'
            )
            .end(done)

      it 'truncates long name', (done) ->
        # This doesn't check the image upload.
        request
        .post('/perfil/save')
        .set('cookie', cookie)
        .send({
          'name': '123456789012345678901'
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
                if res.body.user.name isnt '12345678901234567890'
                  console.log(res.body.user.name)
                  return 'Truncate failed'
            )
            .end(done)