data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'

getBackgroundImage = (selector) ->
  return $(selector).css('background-image')

describe 'Image uploads', ->
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

  describe 'User profile', ->
    it 'meets preconditions', ->
      casper.thenOpen base + '/perfil', ->
        profileHeader = @evaluate getBackgroundImage, '#header-background'
        profileImage = @evaluate getBackgroundImage, '#profile-img'
        defaultHeader = base + '/images/default_user_profile.jpg'
        defaultImage = base + '/images/default_user.png'
        profileHeader.should.be.equal 'url(' + defaultHeader + ')'
        profileImage.should.be.equal 'url(' + defaultImage + ')'
    it 'saves image changes', ->
      casper.then ->
        @click '.menu #edit'
        @fill 'form#profile-form', {
          'media.header_upload': 'test/utils/TEST-IMAGE-TINY.jpg',
          'avatars.local_upload': 'test/utils/TEST-IMAGE-TINY.jpg'
        }, false
        @click '#update'
      casper.waitForSelector '#messages .message.success', ->
        profileHeader = @evaluate getBackgroundImage, '#header-background'
        profileImage = @evaluate getBackgroundImage, '#profile-img'
        profileHeader.should.contain 'res.cloudinary.com'
        profileImage.should.contain 'res.cloudinary.com'



  describe 'Recipe page', ->
    it 'meets preconditions', ->
      casper.thenOpen base + '/receta/test-recipe-4', ->
        recipeHeader = @evaluate getBackgroundImage, '#header-background'
        defaultHeader = base + '/images/default_recipe.jpg'
        recipeHeader.should.be.equal 'url(' + defaultHeader + ')'
    it 'saves image changes', ->
      casper.then ->
        @click '.menu #edit'
        @fill 'form#recipe-edit-form', {
          'header_upload': 'test/utils/TEST-IMAGE-TINY.jpg',
        }, false
        @click '#update'
      casper.waitForSelector '#messages .message.success', ->
        recipeHeader = @evaluate getBackgroundImage, '#header-background'
        recipeHeader.should.contain 'res.cloudinary.com'
