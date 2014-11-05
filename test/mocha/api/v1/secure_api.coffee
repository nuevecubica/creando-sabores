must = require 'must'
config = require __dirname + '/../../../../config.js'
data = require __dirname + '/../../../data'
utils = require __dirname + '/../../utils.js'
async = require 'async'
_ = require 'underscore'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

fields = {
  user:
    wrong: [
      '_id', 'id', 'email', 'password', 'schemaVersion', 'isAdmin', 'social',
      'avatars', 'media', 'verifyEmailToken', 'disabledNotifications',
      'disabledHelpers', 'receiveNewsletter', 'resetPasswordToken',
      'resetPasswordDatetime', 'votes', 'phrase'
    ]
    right: ['username', 'name', 'about', 'thumb']

  recipe:
    wrong: ['_id', 'id', 'likes', 'schemaVersion', 'header', 'isPromoted']
    right: ['title', 'portions', 'thumb']

  tip:
    wrong: ['_id', 'id', 'schemaVersion', 'header', 'isPromoted']
    right: ['title', 'tip', 'thumb']

  question:
    wrong: ['_id', 'id', 'schemaVersion']
    right: ['title']
}

testSecureLogin = (api, done) ->
  request
  .get(api)
  .set('cookie','')
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/)
  .expect(401)
  .end(done)

testHiddenFields = (api, key, fields, done) ->
  request
  .get(api)
  .set('cookie', cookie)
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/)
  .expect(200)
  .expect(
    (res) ->
      obj = res.body
      for k in key.split('.')
        obj = obj[k]

      obj = obj[0] if _.isArray obj

      if not _.isObject obj
        return "Object not found for #{key}"

      if fields.wrong and fields.wrong.length
        found = _.intersection Object.keys(obj), fields.wrong
        if found and found.length
          return 'Unsecure fields found! -> ' + found.join(', ')

      if fields.right and fields.right.length
        found = _.intersection Object.keys(obj), fields.right
        if not found or found.length isnt fields.right.length
          return 'Required fields ' + fields.right.join(', ') +
            ' not found! only -> ' + found.join(', ')
  )
  .end(done)


describe 'Secure test for', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase ->
        request
        .post('/api/v1/login')
        .send({
          email: data.users[0].email,
          password: data.users[0].password
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end (err, res) ->
          return done(err) if err
          return done('login error') if not res.body.success or res.body.error
          cookie = res.headers['set-cookie']
          done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe '/api/v1/me', ->
    it 'should require login', (done) -> testSecureLogin '/api/v1/me', done
    it 'should hide fields', (done) ->
      testHiddenFields '/api/v1/me', 'user', fields.user, done

  describe '/api/v1/me/recipes', ->
    api = '/api/v1/me/recipes'
    it 'should require login', (done) ->
      testSecureLogin api, done
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, (err) ->
        return done err if err
        testHiddenFields api, 'recipes.results.0.author', fields.user, done

  describe '/api/v1/me/videorecipes', ->
    api = '/api/v1/me/videorecipes'
    it 'should require login', (done) ->
      testSecureLogin api, done
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, (err) ->
        return done err if err
        testHiddenFields api, 'recipes.results.0.author', fields.user, done

  describe '/api/v1/me/shopping/list', ->
    api = '/api/v1/me/shopping/list'
    it 'should require login', (done) ->
      testSecureLogin api, done
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, done

  describe '/api/v1/me/favourites/list', ->
    api = '/api/v1/me/favourites/list'
    it 'should require login', (done) ->
      testSecureLogin api, done
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, done

  describe '/api/v1/me/tips/favourites/list', ->
    api = '/api/v1/me/tips/favourites/list'
    it 'should require login', (done) ->
      testSecureLogin api, done
    it 'should hide fields', (done) ->
      testHiddenFields api, 'tips.results.0', fields.tip, done

  describe '/api/v1/user/' + data.users[0].username + '/recipes', ->
    api = '/api/v1/user/' + data.users[0].username + '/recipes'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, done

  describe '/api/v1/user/' + data.users[0].username + '/favourites', ->
    api = '/api/v1/user/' + data.users[0].username + '/favourites'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'recipes.results.0', fields.recipe, done

  describe '/api/v1/user/' + data.users[0].username + '/tips', ->
    api = '/api/v1/user/' + data.users[0].username + '/tips'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'tips.results.0', fields.tip, done

  describe '/api/v1/questions', ->
    api = '/api/v1/questions'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'questions.results.0', fields.question, done

  describe '/api/v1/tips/recent', ->
    api = '/api/v1/tips/recent'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'tips.results.0', fields.tip, done

  describe '/api/v1/tips/popular', ->
    api = '/api/v1/tips/popular'
    it 'should hide fields', (done) ->
      testHiddenFields api, 'tips.results.0', fields.tip, done
