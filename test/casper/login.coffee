data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone


describe.only 'WEB Login', ->

  @timeout 60000

  it 'should load home page with a login link', ->
    casper.start base, ->
      'Chefcito Club Gibaja'.should.matchTitle
      'a[href="/acceso"]'.should.be.inDOM

  it 'should reject bad credentials', ->
    casper.thenOpen base + '/acceso', ->
      'Acceso - Chefcito Club Gibaja'.should.matchTitle
      '#login-email'.should.be.inDOM
      '#login-password'.should.be.inDOM
      '#login-email'.should.be.inDOM
      'button[type="submit"]'.should.be.inDOM
      @fill 'form[action="acceso"]', {
        'login_email': data.users[0].email
        'login_password': 'garbage'
      }, true
    casper.then ->
      'Acceso - Chefcito Club Gibaja'.should.matchTitle
      '.error-message'.should.be.inDOM

  it 'should accept good credentials', ->
    casper.thenOpen base + '/acceso', ->
      'Acceso - Chefcito Club Gibaja'.should.matchTitle
      '#login-email'.should.be.inDOM
      '#login-password'.should.be.inDOM
      '#login-email'.should.be.inDOM
      'button[type="submit"]'.should.be.inDOM
      @fill 'form[action="acceso"]', {
        'login_email': data.users[0].email
        'login_password': data.users[0].password
      }, true
    casper.then ->
      'Chefcito Club Gibaja'.should.matchTitle
      'a[href="/salir"]'.should.be.inDOM
