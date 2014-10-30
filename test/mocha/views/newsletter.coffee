must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Newsletter: View', ->

  describe 'GET /:notification(newsletter)/:email/:token/subscribe)', ->
    user = data.getUserByUsername 'testuser3'
    before (done) ->
      request
      .get('/api/v1/test/getNewsletterUsers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        if !res.body.users
          return 'No users'
        for _user in res.body.users
          if _user.email is user.email
            user.token = _user.token
        return null
      .end(done)

    describe 'on request with a valid email and token', ->

      it 'return newsletter confirmation', (done) ->
        request
        .get('/newsletter/' + user.email + '/' + user.token +
          '/subscribe')
        .expect(200)
        .expect(
          (res) ->
            res.text.must.match user.email
        )
        .end(done)

    describe 'on request with a invalid params', ->

      email = 'dummy@ema.il'
      token = '000000000000'

      it 'return an error', (done) ->
        request
        .get('/newsletter/' + email + '/' + token + '/subscribe')
        .expect(404)
        .end(done)

  describe 'GET /:notification(newsletter)/:email/:token/unsubscribe)', ->
    user = data.getUserByUsername 'testuser4'

    before (done) ->
      request
      .get('/api/v1/test/getNewsletterUsers')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        if !res.body.users
          return 'No users'
        for _user in res.body.users
          if _user.email is user.email
            user.token = _user.token
        return null
      .end(done)

    describe 'on request with a valid email and token', ->

      it 'return newsletter confirmation', (done) ->
        request
        .get('/newsletter/' + user.email + '/' + user.token +
          '/unsubscribe')
        .expect(200)
        .expect(
          (res) ->
            res.text.must.match user.email
            res.text.must.match '<a id="unsubscribe" data-url="/api/v1/' +
              'notifications/' + user.email + '/' + user.token +
              '/unsubscribe/newsletter" class="ui button chef button-green">'
        )
        .end(done)

    describe 'on request with a invalid params', ->

      email = 'dummy@ema.il'
      token = '000000000000'

      it 'return an error', (done) ->
        request
        .get('/newsletter/' + email + '/' + token + '/unsubscribe')
        .expect(404)
        .end(done)