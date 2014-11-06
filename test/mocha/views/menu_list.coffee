must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Menus: Lists', ->

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'get /menus', ->
    describe 'on normal request', ->
      it 'returns the expected menus (sorted by rating)', (done) ->
        request
        .get('/menus')
        .expect(200)
        .expect(
          (res) ->
            menus = {}
            for r in data.getBy 'menus', 'state', 'published'
              title = r.title.trim().toUpperCase()
              menus[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while (found = regexp.exec(res.text)) && num < 4
              ++num
              title = found[1].trim()
              # Exists
              if not menus[title]
                keys = Object.keys(menus).join(',')
                return "Invalid menu #{title} in #{keys}"
              # Order
              if last isnt null and menus[title].publishedDate > last
                return "Invalid order #{menus[title].publishedDate} <= #{last}"
              last = menus[title].publishedDate

            num.must.be.gt 0
        )
        .end(done)


  describe 'get /chef/:chef/menus', ->
    describe 'on normal request', ->
      it 'returns the expected menus (sorted by edit date)', (done) ->
        request
        .get('/chef/' + data.users[0].username + '/menus')
        .expect(200)
        .expect(
          (res) ->
            user = data.getUserByUsername data.users[0].username

            filter = (doc) ->
              return (doc.author is user._id)

            menus = {}
            for r in data.getMenusBy filter
              title = r.title.trim().toUpperCase()
              menus[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not menus[title]
                keys = Object.keys(menus).join(',')
                return "Invalid menu #{title} in #{keys}"
              # Owner
              if menus[title].author isnt user._id
                return "Invalid author #{menus[title].author} <> #{user._id}"
              # Order
              if last isnt null and menus[title].publishedDate > last
                return "Invalid order #{menus[title].publishedDate} <= #{last}"
              last = menus[title].publishedDate

            num.must.be.gt 0
        )
        .end(done)


  describe 'get /perfil/menus', ->
    describe 'on unauthenticated request', ->
      it 'returns an error', (done) ->
        request
        .get('/perfil/menus')
        .expect(302)
        .end(done)

    describe 'on authenticated request', ->

      beforeEach (done) ->
        this.timeout 10000
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

      it 'returns the expected menus (sorted by edit date)', (done) ->
        request
        .get('/perfil/menus')
        .set('cookie', cookie)
        .expect(200)
        .expect(
          (res) ->
            user = data.getUserByUsername data.users[0].username

            menus = {}
            for r in data.getMenusBy 'author', user._id
              title = r.title.trim().toUpperCase()
              menus[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not menus[title]
                keys = Object.keys(menus).join(',')
                return "Invalid menu #{title} in #{keys}"
              # Owner
              if menus[title].author isnt user._id
                return "Invalid author #{menus[title].author} <> #{user._id}"
              # Order
              if last isnt null and menus[title].publishedDate > last
                return "Invalid order #{menus[title].publishedDate} <= #{last}"
              last = menus[title].publishedDate

            num.must.be.gt 0
        )
        .end(done)
