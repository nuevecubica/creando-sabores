must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe '(Private) Recipe: Remove', ->

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

  describe 'call to /receta/:recipe/remove', ->
    it 'changes a recipe to removed', (done) ->
      request
      .post('/receta/test-recipe-1/remove')
      .set('cookie', cookie)
      .send({})
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt '/' or
              res.header['api-response-success'] isnt 'Recipe removed' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        if err
          return done err, res
        request
          .get('/receta/test-recipe-1')
          .set('cookie', cookie)
          .expect(404)
          .end(done)

    describe 'but if contest winner', ->
      it 'should not allow it'