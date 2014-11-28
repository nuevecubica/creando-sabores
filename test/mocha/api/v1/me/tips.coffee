must = require 'must'
config = require __dirname + '/../../../../../config.js'
data = require __dirname + '/../../../../data'
utils = require __dirname + '/../../../utils.js'
async = require 'async'

supertest = require 'supertest'
request = supertest.agent config.keystone.publicUrl
cookie = null

describe 'API v1: /me/tips', ->
  this.timeout 5000

  before (done) ->
    this.timeout 10000
    request.get('/').expect 200, (err, res) ->
      utils.revertTestDatabase (err) ->
        utils.loginUser data.users[0], request, (err, res) ->
          cookie = res.headers['set-cookie']
          done()

  afterEach (done) ->
    utils.revertTestDatabase.call this, done

  describe 'GET /me/tips/favourites/:action/:tip', ->
    describe 'on not logged in', ->
      it 'should response an error', (done) ->

        tip = data.getBySlug 'tips', 'tip-1'

        request
        .put('/api/v1/me/tips/favourites/add/' + tip.slug)
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->

      describe 'on favourites list add', (done) ->
        it 'should response with success', (done) ->

          tip = data.getBySlug 'tips', 'tip-1'

          request
          .put('/api/v1/me/tips/favourites/add/' + tip.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/tips/favourites/list')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res) ->
                res.body.tips.total.must.be.equal 1
                slug = res.body.tips.results[0].slug
                slug.must.be.equal tip.slug
            ).end(done)

        it 'should ignore duplicate requests', (done) ->

          tip = data.getBySlug 'tips', 'tip-1'

          request
          .put('/api/v1/me/tips/favourites/add/' + tip.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .put('/api/v1/me/tips/favourites/add/' + tip.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              return done(err) if err

              request
              .get('/api/v1/me/tips/favourites/list')
              .set('cookie', cookie)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(
                (res) ->
                  res.body.tips.total.must.be.equal 1
                  slug = res.body.tips.results[0].slug
                  slug.must.be.equal tip.slug
              )
              .end(done)

        it 'should return error for missing tip', (done) ->
          request
          .put('/api/v1/me/tips/favourites/add/testDummytip')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

      describe 'on favourites list remove', (done) ->
        it 'should response with success', (done) ->

          tip = data.getBySlug 'tips', 'tip-1'

          request
          .put('/api/v1/me/tips/favourites/add/' + tip.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end (err, res) ->
            return done(err) if err

            request
            .put('/api/v1/me/tips/favourites/remove/' + tip.slug)
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end (err, res) ->
              return done(err) if err

              request
              .get('/api/v1/me/tips/favourites/list')
              .set('cookie', cookie)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .expect(
                (res) ->
                  res.body.tips.total.must.be.equal 0
              ).end(done)

        it 'should ignore duplicate requests', (done) ->

          tip = data.getBySlug 'tips', 'tip-1'

          request
          .put('/api/v1/me/tips/favourites/remove/' + tip.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(done)

        it 'should return error for missing tip', (done) ->
          request
          .put('/api/v1/me/tips/favourites/remove/testDummytip')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end(done)

  describe 'GET /me/tips/favourites/list', ->

    describe 'on not logged in', ->
      it 'should response an error', (done) ->
        request
        .get('/api/v1/me/tips/favourites/list')
        .set('cookie','')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end(done)

    describe 'on logged in', ->
      this.timeout 20000

      it 'should paginate properly', (done) ->

        addToFavouriteList = (tip, cb) ->
          request
          .put('/api/v1/me/tips/favourites/add/' + tip.slug)
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(cb)

        tips = data.getBy 'tips', 'state', 'published'

        async.each tips.slice(0,4), addToFavouriteList, ->
          request
          .get('/api/v1/me/tips/favourites/list?page=1&perPage=4')
          .set('cookie', cookie)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.tips.total.must.be.equal 4
              res.body.tips.results.length.must.be.equal 4
          )
          .end (err, res) ->
            return done(err) if err

            request
            .get('/api/v1/me/tips/favourites/list?page=2&perPage=2')
            .set('cookie', cookie)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(
              (res2) ->
                res2.body.tips.total.must.be.equal 4
                res2.body.tips.results.length.must.be.equal 2
                part = res.body.tips.results.slice(2,5)
                res2.body.tips.results.must.be.eql part
            )
            .end(done)

      it 'should update the list, removing invalid references', (done) ->
        utils.loginUser data.users[2], request, (err, res) ->

          cookie2 = res.headers['set-cookie']

          request
          .get('/api/v1/me/tips/favourites/list?perPage=20')
          .set('cookie', cookie2)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .expect(
            (res) ->
              res.body.tips.total.must.be.equal 1
              res.body.tips.results.length.must.be.equal 1
          )
          .end(done)
