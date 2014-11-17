data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#index-header'
}

getHeaderImage = () ->
  return document.getElementById('index-header').style.backgroundImage

getGridImage = () ->
  return document.getElementsByClassName('recipe')[0].style.backgroundImage

describe 'Index page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Index header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false

  # Recipes are not listed as promoted until it is saved in panel
  describe 'Index grid', ->
    it 'exists grid images'
  #     casper.thenOpen base + '/', ->
  #       gridImage = @evaluate getGridImage
  #       gridImage.should.be.equal 'http://res.cloudinary.com/glue/image/
  # upload/v1410166679/eoshasibtc05k6bbuynv.jpg'