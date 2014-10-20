data = require './../data'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#tips-header',
  tipFirstStar: '.ui.rating .icon-chef-star',
}

getHeaderImage = () ->
  return document.getElementById('tips-header').style.backgroundImage

getTipsRatingValues = () ->
  return parseInt(
    document.getElementsByClassName('rating-value').item(0).innerText)


describe 'Tip page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Tip header', ->
    it 'exists tip image', ->
      casper.thenOpen base + '/tip/tip-promoted', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        host = base
        path = '/images/'
        image = 'default_tip.jpg'
        bgImage.should.be.equal 'url(' + host + path + image + ')'

  describe 'from an anonymous user,', ->
    describe 'user gives a rating', ->
      it 'keeps the tip\'s rating count without changes (redirection to login)'

  describe 'from an authenticated user,', ->
    before (done) ->
      casper.thenOpen base + '/acceso', ->
        @fill 'form[action="acceso"]', {
          'action': 'login'
          'login_email': data.users[0].email
          'login_password': data.users[0].password
        }, true

    describe 'user gives a rating', ->
      it 'adds one to the tip\'s rating count', ->
        actualRating = null
        casper.thenOpen base + '/tip/tip-promoted', ->
          '#tip-content .rating'.should.be.inDOM.and.visible
          actualRating = @evaluate getTipsRatingValues
          @click selectors.tipFirstStar
        casper.waitForSelectorTextChange '#info .rating-value ', ->
          newRating = @evaluate getTipsRatingValues
          newRating.should.be.eql actualRating + 1
          (selectors.tipFirstStar + '.active').should.be.inDOM.and.visible

    describe 'user gives a fav', ->
      it 'adds to my favourite\'s list', ->
        casper.thenOpen base + '/tip/tip-promoted', ->
          '#actions .favourite .switch'.should.be.inDOM.and.visible
          @click '#actions .favourite .switch'
        casper.waitForSelector '#actions .favourite .switch.activated', ->
        utils.revertDB()
