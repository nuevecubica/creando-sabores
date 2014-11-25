data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'

baseSelector = '#shopping div[data-slug="test-contest-recipe-liked"]'

describe 'WEB Shopping-list', ->
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

  describe 'Recipe page', ->
    it 'shows the add shopping-list button', ->
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.shopping-add:not(.added)'.should.be.inDOM
        @click '.shopping-add .add'
      casper.waitForSelector '.shopping-add.added', ->
        '.shopping-add.added'.should.be.inDOM
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.shopping-add.added'.should.be.inDOM

  describe 'Shoping-list page' , ->
    it 'shows the shopping-list recipes', ->
      casper.thenOpen base + '/perfil/compra' , ->
        '#shopping [data-slug="test-contest-recipe-liked"]'.should.be.inDOM
    it 'allows to check ingredients', ->
      casper.then ->
        counter=@fetchText baseSelector + ' span.counter'
        counter.should.be.equal '1'
        @click baseSelector + ' .ingredient .checks'
        counter=@fetchText baseSelector + ' span.counter'
        counter.should.be.equal '0'
    it 'allows to delete shopping-list recipe', ->
      casper.wait 500, ->
        # Wait needed so we don't try to remove while the previous clicks are
        # still being processed at the server.
        (baseSelector + ' .shopping-remove').should.be.inDOM
        @click baseSelector + ' .shopping-remove'
      casper.waitWhileSelector baseSelector + ' .shopping-remove', ->
        (baseSelector + ' .shopping-remove').should.not.be.inDOM
