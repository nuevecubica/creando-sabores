data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#contests-header',
}

getHeaderImage = () ->
  return document.getElementById('contests-header').style.backgroundImage

describe 'Contests page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Contests header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/concursos', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false