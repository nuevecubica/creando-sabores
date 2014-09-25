must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Recipes: Lists', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get /recetas', ->
    describe 'on normal request', ->
      it 'returns the expected recipes (sorted by rating)', (done) ->
        request
        .get('/recetas')
        .expect(200)
        .expect(
          (res) ->
            filter = (doc) ->
              return (doc.state is 'published' and
                (!doc.contest or !doc.contest.id)
              )
            recipes = {}
            for r in data.getBy 'recipes', filter
              title = r.title.trim().toUpperCase()
              recipes[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not recipes[title]
                return "Invalid recipe #{title} in #{recipes.keys().join(',')}"
              # Order
              if last isnt null and recipes[title].rating > last
                return "Invalid order #{recipes[title].rating} > #{last}"
              last = recipes[title].rating

            num.must.be.gt 0
        )
        .end(done)


  describe 'get /chef/recetas', ->
    describe 'on normal request', ->
      it 'returns the expected recipes (sorted by edit date)', (done) ->
        request
        .get('/chef/' + data.users[0].username)
        .expect(200)
        .expect(
          (res) ->
            user = data.getUserByUsername data.users[0].username

            filter = (doc) ->
              return (doc.state is 'published' and
                (doc.author is user._id)
              )
            recipes = {}
            for r in data.getBy 'recipes', filter
              title = r.title.trim().toUpperCase()
              recipes[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not recipes[title]
                return "Invalid recipe #{title} in #{recipes.keys().join(',')}"
              # Owner
              if recipes[title].author isnt user._id
                return "Invalid author #{recipes[title].author} <> #{user._id}"
              # Order
              if last isnt null and recipes[title].editDate > last
                return "Invalid order #{recipes[title].editDate} > #{last}"
              last = recipes[title].editDate

            num.must.be.gt 0
        )
        .end(done)


  describe 'get /perfil/recetas', ->
    describe 'on unauthenticated request', ->
      it 'returns an error', (done) ->
        request
        .get('/perfil/recetas')
        .expect(302)
        .end(done)

    describe 'on authenticated request', ->

      beforeEach (done) ->
        this.timeout 10000
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

      it 'returns the expected recipes (sorted by edit date)', (done) ->
        request
        .get('/perfil/recetas')
        .set('cookie', cookie)
        .expect(200)
        .expect(
          (res) ->
            user = data.getUserByUsername data.users[0].username

            recipes = {}
            for r in data.getBy 'recipes', 'author', user._id
              title = r.title.trim().toUpperCase()
              recipes[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not recipes[title]
                return "Invalid recipe #{title} in #{recipes.keys().join(',')}"
              # Owner
              if recipes[title].author isnt user._id
                return "Invalid author #{recipes[title].author} <> #{user._id}"
              # Order
              if last isnt null and recipes[title].editDate > last
                return "Invalid order #{recipes[title].editDate} > #{last}"
              last = recipes[title].editDate

            num.must.be.gt 0
        )
        .end(done)
