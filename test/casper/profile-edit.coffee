data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone

userNewName = 'Canary User Name'
userNewAbout = 'Canary User About'
oldAvatar = ''
oldHeader = ''

clearProfileFields = () ->
  document.getElementById('profile-name').firstChild.nodeValue = ''
  about = document.getElementById('profile-about')
  about.innerHTML = ''

getUserImages = () ->
  a = document.getElementById('profile-img').style.backgroundImage
  b = document.getElementById('profile-header').style.backgroundImage
  return [a, b]

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


describe 'WEB Profile Edit', ->
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
  describe 'Home page', ->
    it 'links to profile', ->
      casper.thenOpen base, ->
        'a[href="/perfil"]'.should.be.inDOM

  describe 'Profile page', ->
    it 'enters editable mode on edit click', ->
      casper.thenOpen base + '/perfil', ->
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        '#profile-name[contenteditable="true"]'.should.not.be.inDOM
        '#profile-about[contenteditable="true"]'.should.not.be.inDOM
        @click '.menu #edit'
        '#manage-wrapper'.should.not.be.visible
        'body.mode-editable'.should.be.inDOM
        '#profile-name[contenteditable="true"]'.should.be.inDOM
        '#profile-about[contenteditable="true"]'.should.be.inDOM
        t = @evaluate getUserImages
        oldAvatar = t[0]
        oldHeader = t[1]

    it 'allows edition in editable mode', ->
      casper.then ->
        # {reset: true} doesn't work yet (see pull #620), so do it manually
        @evaluate clearProfileFields
        @fill 'form#profile-form', {
          'avatars.local_upload': 'public/images/cutlery_03.png'
          'media.header_upload': 'public/images/cutlery_03.png'
        }, false
        @sendKeys '#profile-name', userNewName, {reset: true}
        @sendKeys '#profile-about', userNewAbout, {reset: true}
      casper.then ->
        '#profile-name'.should.have.text userNewName
        '#profile-about'.should.have.text userNewAbout
        t = @evaluate getUserImages
        oldAvatar.should.be.not.equal t[0]
        oldHeader.should.be.not.equal t[1]

    it 'reverts changes on cancel', ->
      casper.then ->
        @click '#cancel'
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        '#profile-name[contenteditable="true"]'.should.not.be.inDOM
        '#profile-about[contenteditable="true"]'.should.not.be.inDOM

        '#profile-name'.should.have.text data.users[0].name
        '#profile-about'.should.have.text data.users[0].about
        t = @evaluate getUserImages
        oldAvatar.should.be.equal t[0]
        oldHeader.should.be.equal t[1]

    it 'saves changes on save', ->
      casper.then ->
        @click '.menu #edit'
        @evaluate clearProfileFields
        @sendKeys '#profile-name', userNewName, {reset: true}
        @sendKeys '#profile-about', userNewAbout, {reset: true}
        @click '#update'
        # Wait until page reloads. A cleaner way is welcome.
        casper.waitFor ->
          @evaluate ->
            return document.getElementById('hidden-name').value.length == 0
      casper.thenOpen base + '/perfil', ->
        '#profile-name'.should.have.text userNewName
        '#profile-about'.should.have.text userNewAbout
      revertDB()