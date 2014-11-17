must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

recipes = data.getBy 'recipes', 'state', 'published'

newMenus = {
  complete: {
    "description": "MENU DESCRIPTION NEW 1",
    "plates": [recipes[0]._id, recipes[1]._id, recipes[2]._id].join(),
    "title": "TEST NEW MENU 1",
    "slug": "test-new-menu-1"
  },
  incomplete: {
    "description": "MENU DESCRIPTION NEW 2",
    "title": "TEST NEW MENU 2",
    "slug": "test-new-menu-2"
  },
  noTitle: {
    "description": "MENU DESCRIPTION NEW 3",
    "plates": [recipes[0]._id, recipes[1]._id, recipes[2]._id].join(),
    "slug": "test-new-menu-3"
  }
}

describe '(Private) Menu: Save', ->

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

  describe 'get /menu/:menu', ->
    describe 'from author', ->
      it 'responds with the form', (done) ->
        request
        .get('/menu/test-menu-published')
        .set('cookie', cookie)
        .expect(200)
        .expect(/menu-edit-form/)
        .end(done)


    describe 'from another user', ->
      it 'doesn\'t respond with the form', (done) ->
        utils.loginUser data.users[2], request, (err, res) ->
          cookie2 = res.headers['set-cookie']
          request
          .get('/menu/test-menu-published')
          .set('cookie', cookie2)
          .expect(200)
          .expect(
            (res) -> return res.text.must.not.match 'menu-edit-form'
          )
          .end(done)

  describe 'call to /menu/:menu/save', ->
    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/menu/test-menu-published/save')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt
                '/menu/test-menu-published/save/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Missing data'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)

    describe 'on modified data', ->
      it 'updates menu and preserves missing fields', (done) ->
        request
        .post('/menu/test-menu-published/save')
        .set('cookie', cookie)
        .send({
          'description': "MENU DESCRIPTION DUMMY 1"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt
                '/menu/test-menu-published/save/..' or
                res.header['api-response-success'] isnt 'Menu saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          return done(err) if err

          request
            .get('/menu/test-menu-published')
            .set('cookie', cookie)
            .expect(200)
            .expect(/MENU DESCRIPTION DUMMY 1/)
            .expect(/TEST MENU PUBLISHED/)
            .end(done)

      it 'keeps slug', (done) ->
        request
        .post('/menu/test-menu-published/save')
        .set('cookie', cookie)
        .send({
          'title': "TEST MENU DUMMY 1"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt
                '/menu/test-menu-published/save/..' or
                res.header['api-response-success'] isnt 'Menu saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          return done(err) if err

          request
            .get('/menu/test-menu-published')
            .set('cookie', cookie)
            .expect(200)
            .expect(/TEST MENU PUBLISHED/)
            .expect(/TEST MENU DUMMY 1/)
            .end(done)

    describe 'on invalid values', ->
      it 'escapes and removes html', (done) ->
        request
        .post('/menu/test-menu-published/save')
        .set('cookie', cookie)
        .send({
          'description': "<strong>TEST INVALID</strong></i>DATA 1</p></div>"
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt
                '/menu/test-menu-published/save/..' or
                res.header['api-response-success'] isnt 'Menu saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          return done(err) if err

          request
            .get('/menu/test-menu-published')
            .set('cookie', cookie)
            .expect(200)
            .expect(/TEST INVALID&lt;\/strong&gt;&lt;\/i&gt;DATA 1/)
            .end(done)

      it 'truncates long name', (done) ->
        text = utils.generateText 600

        request
        .post('/menu/test-menu-published/save')
        .set('cookie', cookie)
        .send({
          'description': text
        })
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt
                '/menu/test-menu-published/save/..' or
                res.header['api-response-success'] isnt 'Menu saved' or
                res.header['api-response-error'] isnt 'false'
              return 'Wrong status headers: Error=' +
                res.header['api-response-error']
        )
        .end (err,res) ->
          return done(err) if err

          request
            .get('/menu/test-menu-published')
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

  describe 'get /nuevo-menu', ->
    describe 'on non-confirmed user', ->
      cookie2 = null

      before (done) ->
        this.timeout 10000
        utils.loginUser data.users[2], request, (err, res) ->
          cookie2 = res.headers['set-cookie']
          done()

      it 'responds with redirect', (done) ->
        request
        .get('/nuevo-menu')
        .set('cookie', cookie2)
        .expect(302)
        .expect(
          (res) -> res.header['location'].must.be.equal '/'
        )
        .end(done)


  describe 'call to /nuevo-menu/save', ->

    describe 'on empty action', ->
      it 'redirects back to the form', (done) ->
        request
        .post('/nuevo-menu/save')
        .set('cookie', cookie)
        .send({})
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/nuevo-menu/save/..' or
                res.header['api-response-success'] isnt 'false' or
                res.header['api-response-error'] isnt 'Missing data'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)

    describe 'on complete data received', ->
      it 'saves menu and redirects', (done) ->
        url = '/menu/' + newMenus.complete.slug
        request
        .post('/nuevo-menu/save')
        .set('cookie', cookie)
        .send(newMenus.complete)
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt url or
                res.header['api-response-success'] isnt 'Menu saved' or
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
              (res) -> return res.text.must.match newMenus.complete.title
            )
            .expect(
              (res) -> return res.text.must.match 'MENU DESCRIPTION NEW 1'
            )
            .end(done)

    describe 'on incomplete data received', ->
      it 'saves menu and redirects', (done) ->
        url = '/menu/' + newMenus.incomplete.slug
        request
        .post('/nuevo-menu/save')
        .set('cookie', cookie)
        .send(newMenus.incomplete)
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt url or
                res.header['api-response-success'] isnt 'Menu saved' or
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
              (res) -> return res.text.must.match newMenus.incomplete.title
            )
            .expect(
              (res) ->
                return res.text.must.match 'MENU DESCRIPTION NEW 2'
            )
            .end(done)

    describe 'on missing title', ->
      it 'doesn\'t save it' , (done) ->
        request
        .post('/nuevo-menu/save')
        .set('cookie', cookie)
        .send(newMenus.noTitle)
        .expect(302)
        .expect(
          (res) ->
            if res.header['location'] isnt '/nuevo-menu/save/..' or
                res.header['api-response-success'] isnt 'false'
              console.error res.header
              return 'Wrong status headers'
        )
        .end(done)