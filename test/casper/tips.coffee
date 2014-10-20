data = require './../data'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#tips-header',
}

getHeaderImage = () ->
  return document.getElementById('tips-header').style.backgroundImage

describe 'Tips page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Tips header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/tips', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false