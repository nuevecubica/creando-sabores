data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone

recipeNewTitle = 'Canary Recipe Title'
recipeNewDescr = 'Canary Recipe Description'

clearRecipeFields = () ->
  document.getElementById('profile-name').firstChild.nodeValue = ''
  about = document.getElementById('profile-about')
  while about.firstChild != about.lastChild
    about.removeChild(about.firstChild)
  about.firstChild.firstChild.nodeValue=  ''

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


describe 'WEB Recipe Edit', ->
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
    it 'enters editable mode on edit click', ->

      casper.thenOpen base + '/receta/' + data.recipes[4].slug, ->
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        'div[contenteditable="true"]'.should.not.be.inDOM
        @click '.menu #edit'
        '#manage-wrapper'.should.not.be.visible
        'body.mode-editable'.should.be.inDOM
        '#recipe-title[contenteditable="true"]'.should.be.inDOM

    it 'allows edition of basic fields in editable mode', ->
      casper.then ->
        @evaluate ->
          $('#recipe-title').html('')
          $('#recipe-description .set-editable').html('')

        @sendKeys '#recipe-title', recipeNewTitle, {reset: true}
        @click '#recipe-difficulty'
        @click '#recipe-difficulty .options .item:first-child'
        @sendKeys '#recipe-description .set-editable',
          recipeNewDescr, {reset: true}

        '#recipe-title'.should.have.text recipeNewTitle
        '#recipe-difficulty .itemSelected .item[data-value="1"]'.should.be.inDOM
        '#recipe-description .set-editable'.should.have.text recipeNewDescr

    it 'reverts changes on cancel', ->
      casper.then ->
        @click '#cancel'
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        'div[contenteditable="true"]'.should.not.be.inDOM

        '#recipe-title'.should.have.text data.recipes[4].title
        '#recipe-difficulty .itemSelected .item[data-value="3"]'.should.be.inDOM
        '#recipe-description .set-editable'.should.have.text 'DESCRIPTION UNPUBLISHED'