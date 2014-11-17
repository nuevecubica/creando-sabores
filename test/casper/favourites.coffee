data = require './../data'
base = require('../utils/casper-config.js').publicUrl


revertDB = () ->
  casper.then ->
    this.page.cookies = []
  casper.thenOpen base + '/acceso', ->
    @fill 'form[action="acceso"]', {
      'action': 'login'
      'login_email': data.admins[0].email
      'login_password': data.admins[0].password
    }, true
  casper.thenOpen base + '/api/v1/admin/generate/test', ->
    this.page.cookies = []


describe 'WEB Favourites-list', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    revertDB()
    casper.thenOpen base + '/acceso', ->
      @fill 'form[action="acceso"]', {
        'action': 'login'
        'login_email': data.users[0].email
        'login_password': data.users[0].password
      }, true

  describe 'Recipe page', ->
    it 'shows the add favourite button', ->
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.favourite .button:not(.activated)'.should.be.inDOM
        @click '.favourite .button:not(.activated)'
      casper.waitForSelector '.favourite .button.activated', ->
        '.favourite .button.activated'.should.be.inDOM
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        '.favourite .button.activated'.should.be.inDOM

    it 'appears on the favourites list when added', ->
      casper.thenOpen base + '/perfil/favoritas' , ->
        '#favourites .recipe'.should.be.inDOM

    it 'removes favourites with the same button', ->
      casper.thenOpen base + '/receta/test-contest-recipe-liked', ->
        @click '.favourite .button.activated'
      casper.waitForSelector '.favourite .button:not(.activated)', ->
        '.favourite .button:not(.activated)'.should.be.inDOM
