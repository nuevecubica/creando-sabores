data = require './../data'
base = require('../utils/casper-config.js').publicUrl

formErrorsAt = (errfields) ->
  # Check we got a valid form
  'Acceso - Creando Sabores, recetas de cocina'.should.matchTitle
  'form[action="/acceso"]'.should.be.inDOM
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

  describe 'Home page', ->
    it 'links to login form', ->
      casper.start base, ->
        'a[href="/acceso"]'.should.be.inDOM

  describe 'Login form', ->
    it 'shows the login form', ->
      casper.thenOpen base + '/acceso', ->
        formErrorsAt []

    it 'shows 2 errors for 2 missing fields', (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': ''
          'login_password': ''
        }, true
      casper.then ->
        formErrorsAt ['#email', '#password']

    it 'shows password error for missing password', (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': ''
        }, true
      casper.then ->
        formErrorsAt ['#password']

    it 'shows 2 errors for wrong password', (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': 'garbage'
        }, true
      casper.then ->
        formErrorsAt ['#email', '#password']

    it 'shows 1 error for password if social user (w/no password)', (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': data.users[1].email
          'login_password': 'garbage'
        }, true
      casper.then ->
        formErrorsAt ['#password']

    it 'grants access for correct password', (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="/acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': data.users[0].password
        }, true
      casper.then ->
        'Creando Sabores, recetas de cocina'.should.matchTitle
        'a[href="/salir"]'.should.be.inDOM
      casper.thenOpen base + '/salir'
