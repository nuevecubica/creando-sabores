must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../config.js'
data = require __dirname + '/../data.json'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe.only 'PRIVATE RECIPE - SAVE', ->

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

  describe 'GET /receta/:recipe', ->
    describe 'from author', ->
      it 'responds with the form'

    describe 'from another user', ->
      it 'doesn\'t respond with the form'

  describe 'POST /receta/:recipe/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/receta/test-recipe-1/save/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Missing data'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)

    describe 'on modified data', ->
      it 'updates recipe and preserves missing fields', (done) ->
        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({
          'description': "DESCRIPTION DUMMY 1"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/receta/test-recipe-1/save/..' or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get('/receta/test-recipe-1')
            .set('cookie', cookie)
            .expect(200)
            .expect(/DESCRIPTION DUMMY 1/)
            .expect(/TEST RECIPE 1/)
            .end(done)

      it 'keeps slug', (done) ->
        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({
          'title': "TEST DUMMY 1"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/receta/test-recipe-1/save/..' or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get('/receta/test-recipe-1')
            .set('cookie', cookie)
            .expect(200)
            .expect(/DESCRIPTION 1/)
            .expect(/TEST DUMMY 1/)
            .end(done)

    describe 'on invalid values', ->
      it 'escapes and removes html', (done) ->
        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({
          'description': "<strong>TEST INVALID</strong></i>DATA 1</p></div>"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/receta/test-recipe-1/save/..' or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get('/receta/test-recipe-1')
            .set('cookie', cookie)
            .expect(200)
            .expect(/TEST INVALID&lt;\/strong&gt;&lt;\/i&gt;DATA 1/)
            .end(done)

      it 'truncates long name', (done) ->
        text = utils.generateText 600

        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({
          'description': text
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/receta/test-recipe-1/save/..' or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get('/receta/test-recipe-1')
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match text.substring 0, 100
            )
            .expect(
              (res) -> return res.text.must.not.match text
            )
            .end(done)

#------------------------------------------------------------------------------

  describe 'POST /nueva-receta/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/nueva-receta/save/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Missing data'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)

    describe 'on complete data received', ->
      it 'saves recipe and redirects', (done) ->
        url = '/receta/' + data.newRecipes[0].slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(data.newRecipes[0])
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt url or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              console.error res.header
              return 'Wrong status headers'
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get(url)
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match data.newRecipes[0].title
            )
            .expect(
              (res) -> return res.text.must.match 'INGREDIENT NEW 1'
            )
            .end(done)

    describe 'on incomplete data received', ->
      it 'saves recipe and redirects', (done) ->
        url = '/receta/' + data.newRecipes[1].slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(data.newRecipes[1])
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt url or
                res.header['api-response-success'] isnt 'Recipe saved' or
                res.header['api-response-error'] isnt 'false'
              console.error res.header
              return 'Wrong status headers'
        )
        .end (err,res) ->
          if err
            return done err, res
          request
            .get(url)
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match data.newRecipes[1].title
            )
            .expect(
              (res) ->
                return res.text.must.match 'DESCRIPTION NEW ' +
                '&lt;h1&gt;2&lt;/h1&gt;'
            )
            .end(done)

    describe 'on missing title', ->
      it 'doesn\'t save it' , (done) ->
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(data.newRecipes[2])
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/nueva-receta/save/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Error: Unknown error'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)
