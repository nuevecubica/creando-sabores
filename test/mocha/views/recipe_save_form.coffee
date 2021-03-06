must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

newRecipes = {
  complete: {
    "description": "DESCRIPTION NEW 1",
    "ingredients": "INGREDIENT NEW 1\nINGREDIENT NEW 2\nINGREDIENT NEW 3",
    "procedure": "PROCEDURE NEW STEP 1\nPROCEDURE NEW STEP 2",
    "title": "TEST NEW RECIPE 1",
    "slug": "test-new-recipe-1",
    "portions": 1,
    "time": 30,
    "difficulty": 1
  },
  incomplete: {
    "description": "DESCRIPTION NEW <h1>2</h1>",
    "title": "TEST NEW RECIPE 2",
    "slug": "test-new-recipe-2",
    "portions": 10,
    "time": 90,
    "difficulty": 5
  },
  noTitle: {
    "description": "DESCRIPTION NEW 3",
    "portions": 12,
    "time": 60,
    "difficulty": 3
  }
}

describe '(Private) Recipe: Save', ->

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

  describe 'get /receta/:recipe', ->
    describe 'from author', ->
      it 'responds with the form', (done) ->
        request
        .get('/receta/test-recipe-1')
        .set('cookie', cookie)
        .expect(200)
        .expect(/recipe-edit-form/)
        .end(done)


    describe 'from another user', ->
      it 'doesn\'t respond with the form', (done) ->
        utils.loginUser data.users[2], request, (err, res) ->
          cookie2 = res.headers['set-cookie']
          request
          .get('/receta/test-recipe-1')
          .set('cookie', cookie2)
          .expect(200)
          .expect(
            (res) -> return res.text.must.not.match 'recipe-edit-form'
          )
          .end(done)

  describe 'call to /receta/:recipe/save', ->
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
          return done(err) if err

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
          return done(err) if err

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
          return done(err) if err

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
          return done(err) if err

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

      it 'truncates ingredients', (done) ->
        ingredients = (num for num in [0..60])

        request
        .post('/receta/test-recipe-1/save')
        .set('cookie', cookie)
        .send({
          'ingredients': ingredients.join("\n")
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
          return done(err) if err

          request
            .get('/receta/test-recipe-1')
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match ingredients[49]
            )
            .expect(
              (res) -> return res.text.must.not.match ingredients[51]
            )
            .end(done)

#------------------------------------------------------------------------------

  describe 'get /nueva-receta', ->
    describe 'on non-contest', ->
      it 'responds with the form', (done) ->
        request
        .get('/nueva-receta')
        .set('cookie', cookie)
        .expect(200)
        .expect(
          (res) -> return res.text.must.match 'recipe-edit-form'
        )
        .end(done)

    describe 'on non-confirmed user', ->
      cookie2 = null

      before (done) ->
        this.timeout 10000
        utils.loginUser data.users[2], request, (err, res) ->
          cookie2 = res.headers['set-cookie']
          done()

      it 'responds with redirect', (done) ->
        request
        .get('/nueva-receta')
        .set('cookie', cookie2)
        .expect(302)
        .expect(
          (res) -> res.header['location'].must.be.equal '/'
        )
        .end(done)

    describe 'on submission state contest', ->
      it 'responds with the form', (done) ->
        request
        .get('/nueva-receta/test-contest-submission')
        .set('cookie', cookie)
        .expect(200)
        .expect(
          (res) -> return res.text.must.match 'recipe-edit-form'
        )
        .end(done)

    describe 'on non-submission state contest', ->
      it 'responds with error', (done) ->
        request
        .get('/nueva-receta/test-contest-programmed')
        .set('cookie', cookie)
        .expect(404)
        .end(done)



  describe 'call to /nueva-receta/save', ->

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
        url = '/receta/' + newRecipes.complete.slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(newRecipes.complete)
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
          return done(err) if err

          request
            .get(url)
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match newRecipes.complete.title
            )
            .expect(
              (res) -> return res.text.must.match 'INGREDIENT NEW 1'
            )
            .end(done)

    describe 'on incomplete data received', ->
      it 'saves recipe and redirects', (done) ->
        url = '/receta/' + newRecipes.incomplete.slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(newRecipes.incomplete)
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
          return done(err) if err

          request
            .get(url)
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match newRecipes.incomplete.title
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
        .send(newRecipes.noTitle)
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

    describe 'on contest recipe, submission state', ->
      it 'saves it and associates it to the contest', (done) ->

        contest = data.getBySlug 'contests', 'test-contest-submission'

        tdata = newRecipes.complete
        tdata['contest.id'] = contest._id

        url = '/receta/' + tdata.slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(tdata)
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
          return done(err) if err

          request
            .get(url)
            .set('cookie', cookie)
            .expect(200)
            .expect(
              (res) -> return res.text.must.match tdata.title
            )
            .expect(
              (res) -> return res.text.must.match 'contest-recipe'
            )
            .expect(
              (res) -> return res.text.must.match 'state-draft'
            )
            .end(done)

    describe 'on contest recipe, other state', ->
      it 'returns an error', (done) ->

        contest = data.getBySlug 'contests', 'test-contest-finished'

        tdata = newRecipes.complete
        tdata['contest.id'] = contest._id

        url = '/receta/' + tdata.slug
        request
        .post('/nueva-receta/save')
        .set('cookie', cookie)
        .send(tdata)
        .expect(302)
        .expect(
          (res) ->
            msg = 'Error: Invalid contest state'
            if res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt msg
              console.error res.header
              return 'Wrong status headers'
        )
        .end done
