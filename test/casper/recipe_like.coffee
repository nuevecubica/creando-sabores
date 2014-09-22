data = require './../data.json'
base = 'http://0.0.0.0:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  recipes: '#recipes',
  recipe: '#recipes .like-counter'
  recipeButton: '#recipes .row.position:first-child .like-button'
}

getRecipeLikeCounters = (ind) ->
  # return document.getElementsByClassName('like-counter').length
  return document.getElementsByClassName('like-counter').item(1).innerText

describe 'Recipe receives a like or unlike', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe.only 'from an anonymous user,', ->
    describe 'user gives a like', ->
      it 'keeps the recipe\'s like count (nothing changes)', ->
        casper.thenOpen base + '/concurso/' + data.contests[2].slug +
        '/participantes/reciente', ->
          (selectors.recipes).should.be.inDOM.and.visible

          actualLikes = @evaluate getRecipeLikeCounters(0)
          console.log actualLikes

          @click selectors.recipeButton
          @then =>
            newLikes = @evaluate getRecipeLikeCounters
            newLikes.should.be.eql actualLikes

    describe 'user gives an unlike', ->
      it 'keeps the recipe\'s like count (nothing changes)'#, ->
      #   casper.thenOpen base + '/concurso/' + data.contests[2].slug +
      #     '/participantes/reciente', ->
      #     (selectors.recipes).should.be.inDOM.and.visible

      #     actualLikes = @evaluate getRecipeLikeCounters 1

      #     @click selectors.recipeButton
      #     @then =>
      #       newLikes = @evaluate getRecipeLikeCounters 1
      #       newLikes.should.be.eql actualLikes

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
        it 'adds one to the recipe\'s like counter'#, ->
      #     casper.thenOpen base + '/concurso/' + data.contests[2].slug +
      #        '/participantes/reciente', ->
      #       (selectors.recipes).should.be.inDOM.and.visible

      #       actualLikes = @evaluate getRecipeLikeCounters 0

      #       @click selectors.recipeButton
      #       @then =>
      #         newLikes = @evaluate getRecipeLikeCounters 0
      #         newLikes.should.be.eql actualLikes + 1

      describe 'but recipe has a vote from the user already', ->
        it 'keeps the recipe\'s like count'
      describe 'from an unknown referer', ->
        it 'ignores it'

    describe 'user gives an unlike', ->
      describe 'and recipe does not have a vote from the user', ->
        it 'keeps the recipe\'s like count'
      describe 'but recipe has a vote from the user', ->
        it 'substracts one from the recipe\'s like counter'
      describe 'from an unknown referer', ->
        it 'ignores it'
