__base = __dirname + '/../../../../../'
must = require 'must'
config = require __base + 'config.js'
data = require __base + 'test/data'
utils = require __base + 'test/mocha/utils.js'

supertest = require('supertest')
request = supertest.agent config.keystone.publicUrl

describe 'API TEST v1: /test/sendEmail', ->
  this.timeout 10000

  user = data.users[0]

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase(done)

  describe 'with no data', ->
    it 'responds with error', (done) ->
      request
      .post('/api/v1/test/sendEmail')
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .expect (res) ->
        return 'error' if !res.body.error or res.body.success
      .end(done)

  describe 'with valid data', ->
    it 'responds with success', (done) ->
      request
      .post('/api/v1/test/sendEmail')
      .send({
        id: 'test-email'
        data: {
          user: user
        }
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        return 'Wrong headers' if !res.body.success or res.body.error
        # Output
        if res.body.output.status and res.body.output.status is 'error'
          return "Mandrill error: #{res.body.output.message}"
        res.body.output.length.must.be.eql 1
        for output in res.body.output
          if output.status isnt 'sent'
            return "Mandrill error: #{res.body.output.message}"
      .end(done)

    it 'renders a valid email', (done) ->
      request
      .post('/api/v1/test/sendEmail?render=1')
      .send({
        id: 'test-email'
        data: {
          user: user
        }
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect (res) ->
        return 'Wrong headers' if !res.body.success or res.body.error
        # Output
        if res.body.output.status and res.body.output.status is 'error'
          return "Mandrill error: #{res.body.output.message}"
        res.body.output.html.must.match user.name
        res.body.output.html.must.match user.email
      .end(done)
