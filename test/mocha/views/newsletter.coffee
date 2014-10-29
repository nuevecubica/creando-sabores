must = require 'must'
keystone = require 'keystone'
config = require __dirname + '/../../../config.js'
data = require __dirname + '/../../data'
utils = require __dirname + '/../utils.js'

request = require('supertest') config.keystone.publicUrl
cookie = null

describe 'Newsletter: View', ->
  describe 'GET /:notification(newsletter)/:email/:token/subscribe)', ->
    describe 'on request with a valid email and token', ->

      user = data.users[4]

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
    describe 'on request with a valid email and token', ->

      user = data.users[4]

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