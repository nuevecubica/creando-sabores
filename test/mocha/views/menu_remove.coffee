must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe '(Private) Menu: Remove', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  beforeEach (done) ->
    this.timeout 10000
    utils.loginUser data.users[0], request, (err, res) ->
      cookie = res.headers['set-cookie']
      done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'call to /menu/:menu/remove', ->
    it 'changes a menu to removed', (done) ->
      request
      .post('/menu/test-menu-published/remove')
      .set('cookie', cookie)
      .send({})
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt '/' or
              res.header['api-response-success'] isnt 'Menu removed' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        if err
          return done err, res
        request
          .get('/menu/test-menu-published')
          .set('cookie', cookie)
          .expect(404)
          .end(done)