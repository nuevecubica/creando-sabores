data = require './../data'
config = require './../../config.js'
base = config.keystone.publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

# Default viewport is 400x300, but bubbles are hidden in tablet
casper.options.viewportSize = {width: 1080, height: 720}

describe 'New recipe - tooltip', ->
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

  describe 'Recipe page - Basics', ->
    it 'enters new-recipe mode and works close bubble', ->
      casper.thenOpen base + '/nueva-receta'
      casper.waitUntilVisible '#info .tutorial-bubble', ->
        @click '#info .tutorial-bubble .icon-chef-cross'
        '#info .tutorial-bubble'.should.not.be.visible

    it 'if writes inputs, then hide tool-tips', ->
      casper.thenOpen base + '/nueva-receta'
      casper.waitUntilVisible '#recipe-description .tutorial-bubble', ->
        @sendKeys '#recipe-description .set-editable', 'prueba', {reset: true}
        '#recipe-description .tutorial-bubble'.should.be.not.visible

    it 'does not visible in mobile', ->
      casper.viewport 700, 520, ->
        '#info .tutorial-bubble'.should.not.be.visible
        utils.revertDB()