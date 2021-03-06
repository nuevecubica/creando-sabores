data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#recipe-header',
}

getHeaderImage = () ->
  return document.getElementById('header-background').style.backgroundImage

describe 'New recipe page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()
    casper.thenOpen base + '/acceso', ->
      @fill 'form[action="/acceso"]', {
        'action': 'login'
        'login_email': data.users[0].email
        'login_password': data.users[0].password
      }, true

  describe 'New recipe header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/nueva-receta', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false

    it 'exists header image in contest recipe', ->
      casper.thenOpen base + '/nueva-receta/test-contest-submission', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false