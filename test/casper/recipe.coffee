data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#recipe-header',
  recipeFirstStar: '.ui.rating .icon-chef-star',
}

getHeaderImage = () ->
  return document.getElementById('header-background').style.backgroundImage

getRecipeRatingValues = () ->
  return parseInt(
    document.getElementsByClassName('rating-value').item(0).innerText)

describe 'Recipe page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Recipe header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/receta/test-recipe-1', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        host = 'http://res.cloudinary.com'
        path = '/glue/image/upload/f_auto,t_header_limit_thumb/v1410166679/'
        image = 'eoshasibtc05k6bbuynv.jpg'
        bgImage.should.be.equal 'url(' + host + path + image + ')'

  describe 'from an authenticated user,', ->
    before (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': data.users[0].password
        }, true

    describe 'user gives a rating', ->
      it 'adds one to the recipe\'s rating count', ->
        casper.thenOpen base + '/receta/test-recipe-1', ->
          '#recipe-content .rating'.should.be.inDOM.and.visible
          @click selectors.recipeFirstStar
        casper.waitForSelectorTextChange '#info .rating-value ', ->
          newRating = @evaluate getRecipeRatingValues
          newRating.should.be.eql 1
          (selectors.recipeFirstStar + '.active').should.be.inDOM.and.visible

    describe 'user gives a fav', ->
      it 'adds to my favourite\'s list', ->
        casper.thenOpen base + '/receta/test-recipe-1', ->
          '#actions .favourite .switch'.should.be.inDOM.and.visible
          @click '#actions .favourite .switch'
        casper.waitForSelector '#actions .favourite .switch.activated', ->
        utils.revertDB()