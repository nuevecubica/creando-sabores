data = require './../data.json'
base = 'http://localhost:3000'  # We're outside node, so no keystone


describe 'WEB LOGIN', ->

  @timeout 60000

  describe 'GET /acceso', ->
    it 'responds with the form', ->
      casper.start base + '/acceso', ->
        'Acceso - Chefcito Club Gibaja'.should.matchTitle
        '#login-email'.should.be.inDOM
        '#login-password'.should.be.inDOM
        '#login-email'.should.be.inDOM
        'button[type="submit"]'.should.be.inDOM

  describe 'POST /acceso', ->

    describe 'on some fields missing', ->
      it 'responds with password error for missing password', (done) ->
        casper.thenOpen base + '/acceso', ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
          }, true
        casper.then ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          '#email .error-message'.should.not.contain.text('no')
          '#password .error-message'.should.contain.text('no')

      it 'responds with 2 errors for 2 empty fields', (done) ->
        casper.thenOpen base + '/acceso', ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          @fill 'form[action="acceso"]', {
            'action': 'login'
          }, true
        casper.then ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          '#email .error-message'.should.contain.text('no')
          '#password .error-message'.should.contain.text('no')

    describe 'on invalid password', ->
      it 'responds with 2 errors', (done) ->
        casper.thenOpen base + '/acceso', ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
            'login_password': 'garbage'
          }, true
        casper.then ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          '#email .error-message'.should.contain.text('no')
          '#password .error-message'.should.contain.text('no')

    describe 'on password received for an user without password', ->
      it 'responds with 1 error', (done) ->
        casper.thenOpen base + '/acceso', ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[1].email
            'login_password': 'garbage'
          }, true
        casper.then ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          '#email .error-message'.should.not.contain.text('no')
          '#password .error-message'.should.contain.text('social')

    describe 'on valid user credentials', ->
      it 'grants access', (done) ->
        casper.thenOpen base + '/acceso', ->
          'Acceso - Chefcito Club Gibaja'.should.matchTitle
          @fill 'form[action="acceso"]', {
            'action': 'login'
            'login_email': data.users[0].email
            'login_password': data.users[0].password
          }, true
        casper.then ->
          'Chefcito Club Gibaja'.should.matchTitle
          'a[href="/salir"]'.should.be.inDOM
