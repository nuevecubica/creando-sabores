data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone

formErrorsAt = (errfields) ->
  # Check we got a valid form
  'Acceso - Chefcito Club Gibaja'.should.matchTitle
  'form[action="acceso"]'.should.be.inDOM
  '#login-email'.should.be.inDOM
  '#login-password'.should.be.inDOM
  '#login-email'.should.be.inDOM
  'button[type="submit"]'.should.be.inDOM
  # Check for the errors
  allfields = ['#email', '#password']
  for field in allfields
    if field in errfields
      (field+'.error-here').should.be.inDOM
    else
      (field+'.error-here').should.not.be.inDOM

describe 'WEB LOGIN', ->

  @timeout 60000

  describe 'GET /acceso', ->
    it 'responds with the form', ->
      casper.start base + '/acceso', ->
        formErrorsAt []

  describe 'POST /acceso', ->

    describe 'on empty action', ->
      it 'responds with the form, no errors', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': ''
            'login_email': ''
            'login_password': ''
          }, true
        casper.then ->
          formErrorsAt []


    describe 'on some fields missing', ->
      it 'responds with password error for missing password', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
            'login_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#password']

      it 'responds with 2 errors for 2 empty fields', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': ''
            'login_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#email', '#password']

    describe 'on invalid password', ->
      it 'responds with 2 errors', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
            'login_password': 'garbage'
          }, true
        casper.then ->
          formErrorsAt ['#email', '#password']

    describe 'on password received for an user without password', ->
      it 'responds with 1 error', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[1].email
            'login_password': 'garbage'
          }, true
        casper.then ->
          formErrorsAt ['#password']

    describe 'on valid user credentials', ->
      it 'grants access', (done) ->
        casper.thenOpen base + '/acceso', ->
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
            'login_password': data.users[0].password
          }, true
        casper.then ->
          'Chefcito Club Gibaja'.should.matchTitle
          'a[href="/salir"]'.should.be.inDOM
