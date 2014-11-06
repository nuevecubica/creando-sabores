must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe.only '(Private) Menu: Publish & Draft', ->

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

  describe 'call to /menu/:menu/draft', ->
    it 'changes a menu to draft', (done) ->
      request
      .get('/menu/test-menu-published/draft')
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt '/menu/test-menu-published/draft/..' or
              res.header['api-response-success'] isnt 'Menu draft' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        request
          .get('/menu/test-menu-published')
          .set('cookie', cookie)
          .expect(200)
          .expect(/\/menu\/test-menu-published\/publish/)
          .expect(/Publicar/)
          .end(done)

  describe 'call to /menu/:menu/publish', ->
    it 'changes a menu to published', (done) ->
      url = '/menu/test-menu-draft/publish'
      request
      .get(url)
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt "#{url}/.." or
              res.header['api-response-success'] isnt 'Menu published' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        request
          .get('/menu/test-menu-draft')
          .set('cookie', cookie)
          .expect(200)
          .expect(/\/menu\/test-menu-draft\/draft/)
          .expect(/Borrador/)
          .end(done)