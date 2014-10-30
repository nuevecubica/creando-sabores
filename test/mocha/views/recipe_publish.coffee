must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe '(Private) Recipe: Publish & Draft', ->

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

  describe 'call to /receta/:recipe/draft', ->
    it 'changes a recipe to draft', (done) ->
      request
      .get('/receta/test-recipe-1/draft')
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt '/receta/test-recipe-1/draft/..' or
              res.header['api-response-success'] isnt 'Recipe unpublished' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        request
          .get('/receta/test-recipe-1')
          .set('cookie', cookie)
          .expect(200)
          .expect(/\/receta\/test-recipe-1\/publish/)
          .expect(/Publicar/)
          .end(done)

    it 'changes a contest recipe to draft', (done) ->
      request
      .get('/receta/test-contest-recipe-liked/draft')
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          loc = '/receta/test-contest-recipe-liked/draft/..'
          if res.header['location'] isnt loc or
              res.header['api-response-success'] isnt 'Recipe unpublished' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        request
          .get('/receta/test-contest-recipe-liked')
          .set('cookie', cookie)
          .expect(200)
          .expect(/\/receta\/test-contest-recipe-liked\/publish/)
          .expect(/Publicar/)
          .end(done)

  describe 'call to /receta/:recipe/publish', ->
    it 'changes a recipe to published', (done) ->
      url = '/receta/test-recipe-unpublished/publish'
      request
      .get(url)
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          if res.header['location'] isnt "#{url}/.." or
              res.header['api-response-success'] isnt 'Recipe published' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        request
          .get('/receta/test-recipe-unpublished')
          .set('cookie', cookie)
          .expect(200)
          .expect(/\/receta\/test-recipe-unpublished\/draft/)
          .expect(/Borrador/)
          .end(done)

    it 'changes a contest recipe to review', (done) ->
      request
      .get('/receta/test-contest-recipe-liked/draft')
      .set('cookie', cookie)
      .expect(302)
      .expect(
        (res) ->
          loc = '/receta/test-contest-recipe-liked/draft/..'
          if res.header['location'] isnt loc or
              res.header['api-response-success'] isnt 'Recipe unpublished' or
              res.header['api-response-error'] isnt 'false'
            console.error res.header
            return 'Wrong status headers'
      )
      .end (err, res) ->
        return done(err) if err

        url = '/receta/test-contest-recipe-liked/publish'
        request
        .get(url)
        .set('cookie', cookie)
        .expect(302)
        .expect(
          (res) ->
            successmsg = 'Recipe waiting for review'
            if res.header['location'] isnt "#{url}/.." or
                res.header['api-response-success'] isnt successmsg or
                res.header['api-response-error'] isnt 'false'
              console.error res.header
              return 'Wrong status headers'
        )
        .end (err, res) ->
          return done(err) if err

          request
            .get('/receta/test-contest-recipe-liked')
            .set('cookie', cookie)
            .expect(200)
            .expect(/\/receta\/test-contest-recipe-liked\/draft/)
            .expect(/Borrador/)
            .end(done)
