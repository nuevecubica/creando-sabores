data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = [
  '#recipe-title',
  '#recipe-time .set-editable',
  '#recipe-portions .set-editable',
  '#recipe-description .set-editable'
]

describe 'Recipe receives a like or unlike', ->
  @timeout 60000

  describe 'from an anonymous user,', ->
    describe 'user gives a like', ->
      it 'keeps the recipe\'s like count (nothing changes)'
    describe 'user gives an unlike', ->
      it 'keeps the recipe\'s like count (nothing changes)'

  describe 'from an authenticated user,', ->

    before (done) ->
      casper.start base, ->
        # Do Nothing.
      utils.revertDB()
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': data.users[0].password
        }, true

    describe 'user gives a like', ->
      describe 'and recipe does not have a vote from the user', ->
        it 'adds one to the recipe\'s like counter'
      describe 'but recipe has a vote from the user already', ->
        it 'keeps the recipe\'s like count'

    describe 'user gives an unlike', ->
      describe 'and recipe does not have a vote from the user', ->
        it 'keeps the recipe\'s like count'
      describe 'but recipe has a vote from the user', ->
        it 'substracts one from the recipe\'s like counter'
