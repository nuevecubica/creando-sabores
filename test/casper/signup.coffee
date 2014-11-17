data = require './../data'
base = require('../utils/casper-config.js').publicUrl

formErrorsAt = (errfields) ->
  # Check we got a valid form
  'Registro - Chefcito Club Gibaja'.should.matchTitle
  'form[action="/registro"]'.should.be.inDOM
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

describe 'WEB SIGNUP', ->
  @timeout 60000

  describe 'Home page', ->
    it 'links to signup form', ->
      casper.start base, ->
        'a[href="/registro"]'.should.be.inDOM

  describe 'Signup form', ->
    it 'shows the signup form', ->
      casper.thenOpen base + '/registro', ->
        formErrorsAt []

    it 'shows 3 errors for 3 missing fields', (done) ->
      casper.thenOpen base + '/registro', ->
        @fill 'form[action="/registro"]', {
          'action': 'signup'
          'signup_name': ''
          'signup_email': ''
          'signup_password': ''
        }, true
      casper.then ->
        formErrorsAt ['#name', '#email', '#password']

    it 'shows 2 errors for 2 missing fields', (done) ->
      casper.thenOpen base + '/registro', ->
        @fill 'form[action="/registro"]', {
          'action': 'signup'
          'signup_name': ''
          'signup_email': data.users[0].email
          'signup_password': ''
        }, true
      casper.then ->
        formErrorsAt ['#name', '#password']

    it 'shows password error for missing password', (done) ->
      casper.thenOpen base + '/registro', ->
        @fill 'form[action="/registro"]', {
          'action': 'signup'
          'signup_name': 'TestDummyName'
          'signup_email': data.users[0].email
          'signup_password': ''
        }, true
      casper.then ->
        formErrorsAt ['#password']

    it 'login success for existing user and pass, without username', (done) ->
      casper.thenOpen base + '/registro', ->
        @fill 'form[action="/registro"]', {
          'action': 'signup'
          'signup_name': ''
          'signup_email': data.users[0].email
          'signup_password': data.users[0].password
        }, true
      casper.then ->
        'Chefcito Club Gibaja'.should.matchTitle
        'a[href="/salir"]'.should.be.inDOM
      casper.thenOpen base + '/salir'

    it 'login success for existing user and pass, dummy username', (done) ->
      casper.thenOpen base + '/registro', ->
        @fill 'form[action="/registro"]', {
          'action': 'signup'
          'signup_name': 'TestDummyName'
          'signup_email': data.users[0].email
          'signup_password': data.users[0].password
        }, true
      casper.then ->
        'Chefcito Club Gibaja'.should.matchTitle
        'a[href="/salir"]'.should.be.inDOM
      casper.thenOpen base + '/salir'
