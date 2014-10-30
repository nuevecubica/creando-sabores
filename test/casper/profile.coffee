data = require './../data'
config = require './../../config.js'
base = config.keystone.publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#profile-header',
}

getHeaderImage = () ->
  return document.getElementById('profile-header').style.backgroundImage

describe 'Profile page', ->
  @timeout 60000

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

  describe 'Profile header', ->
    it 'exists header image in private profile', ->
      casper.thenOpen base + '/perfil', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false

  describe 'Contextual menu', ->
    it 'works hidden class', ->
      casper.thenOpen base + '/perfil', ->
        '#menu-wrapper #contextual-menu'.should.be.not.visible
        @click '#menu-wrapper .username'
        '#menu-wrapper #contextual-menu'.should.be.visible
        @click '#menu-wrapper .arrow-down'
      casper.waitForSelector '#menu-wrapper #contextual-menu.hidden', ->
        '#menu-wrapper #contextual-menu'.should.be.not.visible