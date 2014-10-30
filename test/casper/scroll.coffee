data = require './../data'
config = require './../../config.js'
base = config.keystone.publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  loading: '.loader .loading'
}

getLinks = ->
  return $('.list .recipe a.hover-list').map ->
    return this.href
  .get()

links = []

# Default viewport is 400x300, so the load-more button will never fit on it
casper.options.viewportSize = {width: 800, height: 600}


describe 'Infinite scroll', ->
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

  describe 'at profile recipes list', ->
    it 'loads more on scroll', ->
      casper.thenOpen base + '/perfil/recetas', ->
        links = @evaluate getLinks
        @scrollToBottom()
      casper.waitUntilVisible selectors.loading
      casper.waitWhileVisible selectors.loading, ->
        newlinks = @evaluate getLinks
        newlinks.slice(0,5).should.be.eql links
        newlinks.length.should.be.above links.length