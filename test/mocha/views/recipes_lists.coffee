must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data.json'
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
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1
            recipes.sort (a,b) -> return b.rating - a.rating
            if recipes.length > 5
              recipes = recipes.slice 0, 5
            # Compare results
            positions = (res.text.lastIndexOf(r.title) for r in recipes)
            prevpos = 0
            for pos in positions
              pos.must.be.gt prevpos
              prevpos = pos
            return
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
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) ->
              not recipe.isBanned and recipe.state == 1 and recipe.author == 1
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            if recipes.length > 5
              recipes = recipes.slice 0, 5
            # Compare results
            positions = (res.text.lastIndexOf(r.title) for r in recipes)
            prevpos = 0
            for pos in positions
              pos.must.be.gt prevpos
              prevpos = pos
            return
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
            # Make our independent sorting and filtering
            recipes = data.recipes.filter (recipe) -> recipe.author == 1
            recipes.sort (a,b) -> return b.editDate.localeCompare(a.editDate)
            if recipes.length > 5
              recipes = recipes.slice 0, 5
            # Compare results
            positions = (res.text.lastIndexOf(r.title) for r in recipes)
            prevpos = 0
            for pos in positions
              pos.must.be.gt prevpos
              prevpos = pos
            return
        )
        .end(done)
