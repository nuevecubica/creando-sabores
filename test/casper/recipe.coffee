data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#recipe-header',
}

getHeaderImage = () ->
  return document.getElementById('recipe-header').style.backgroundImage

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
        bgImage.should.be.equal 'url(http://res.cloudinary.com/glue/image/upload/f_auto,t_header_limit_thumb/eoshasibtc05k6bbuynv.jpg)'