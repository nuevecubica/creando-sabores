data = require './../data'
base = require('./config.js').publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

describe 'WEB Shopping-list', ->
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

  describe 'Recipe page', ->
    it 'shows the add shopping-list button', ->
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.shopping-add:not(.disabled)'.should.be.inDOM
        @click '.shopping-add:not(.disabled)'
      casper.waitForSelector '.shopping-add.disabled', ->
        '.shopping-add.disabled'.should.be.inDOM
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.shopping-add.disabled'.should.be.inDOM

  describe 'Shoping-list page' , ->
    it 'shows the shopping-list recipes', ->
      casper.thenOpen base + '/perfil/compra' , ->
        '#shopping [data-slug="test-contest-recipe-liked"]'.should.be.inDOM
    it 'allows to check ingredients', ->
      casper.then ->
        counter=@fetchText '#shopping span.counter'
        counter.should.be.equal '1'
        @click '#shopping .ingredient .checks'
        counter=@fetchText '#shopping span.counter'
        counter.should.be.equal '0'
    it 'allows to delete shopping-list recipe', ->
      casper.then ->
        '#shopping .shopping-remove'.should.be.inDOM
        @click '#shopping .shopping-remove'
      casper.waitWhileSelector '#shopping .shopping-remove', ->
        '#shopping .shopping-remove'.should.not.be.inDOM