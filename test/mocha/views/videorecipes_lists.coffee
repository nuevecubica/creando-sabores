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

  describe 'get /videorecetas', ->
    describe 'on normal request', ->
      it 'returns the expected videorecipes (sorted by rating)', (done) ->
        request
        .get('/videorecetas')
        .expect(200)
        .expect(
          (res) ->
            videorecipes = {}
            for r in data.getVideorecipesBy 'state', 'published'
              title = r.title.trim().toUpperCase()
              videorecipes[title] = r

            # List
            regexp = new RegExp '<h2 class="ui header">([^<]+)</h2>', 'gi'
            last = null
            num = 0
            while found = regexp.exec(res.text)
              ++num
              title = found[1].trim()
              # Exists
              if not videorecipes[title]
                keys = Object.keys(videorecipes).join(',')
                return "Invalid videorecipe #{title} in #{keys}"
              # Order
              if last isnt null and videorecipes[title].rating > last
                return "Invalid order #{videorecipes[title].rating} <= #{last}"
              last = videorecipes[title].rating

            num.must.be.gt 0
        )
        .end(done)
