data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone

formErrorsAt = (errfields) ->
  # Check we got a valid form
  'Registro - Chefcito Club Gibaja'.should.matchTitle
  'form[action="registro"]'.should.be.inDOM
  '#signup-name'.should.be.inDOM
  '#signup-email'.should.be.inDOM
  '#signup-password'.should.be.inDOM
  'button[type="submit"]'.should.be.inDOM
  # Check for the errors
  allfields = ['#name', '#email', '#password']
  for field in allfields
    if field in errfields
      (field+'.error-here').should.be.inDOM
    else
      (field+'.error-here').should.not.be.inDOM

describe.only 'WEB SIGNUP', ->

  @timeout 60000

  describe 'GET /registro', ->
    it 'responds with the form', ->
      casper.start base + '/registro', ->
        formErrorsAt []

  describe 'POST /registro', ->

    describe 'on empty action', ->
      it 'responds with the form, no errors', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': ''
            'signup_name': ''
            'signup_email': ''
            'signup_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#name', '#email', '#password']


    describe 'on some fields missing', ->
      it 'responds with password error for missing password', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': 'signup'
            'signup_name': 'TestDummyName'
            'signup_email': 'TestDummyEmail@dummy.com'
            'signup_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#password']

      it 'responds with 2 errors for 2 fields & 1 pre-filled field', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': 'signup'
            'signup_name': ''
            'signup_email': 'TestDummyEmail@dummy.com'
            'signup_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#name', '#password']

      it 'responds with 3 errors for 3 fields', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': 'signup'
            'signup_name': ''
            'signup_email': ''
            'signup_password': ''
          }, true
        casper.then ->
          formErrorsAt ['#name', '#email', '#password']

    describe 'on valid login credentials', ->
      it 'login success without username', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': 'signup'
            'signup_name': ''
            'signup_email': data.users[0].email
            'signup_password': data.users[0].password
          }, true
        casper.then ->
          'Chefcito Club Gibaja'.should.matchTitle
          'a[href="/salir"]'.should.be.inDOM
        casper.thenOpen base + '/salir'

      it 'login success with dummy username', (done) ->
        casper.thenOpen base + '/registro', ->
          @fill 'form[action="registro"]', {
            'action': 'signup'
            'signup_name': 'TestDummyName'
            'signup_email': data.users[0].email
            'signup_password': data.users[0].password
          }, true
        casper.then ->
          'Chefcito Club Gibaja'.should.matchTitle
          'a[href="/salir"]'.should.be.inDOM
        casper.thenOpen base + '/salir'
