data = require './../data'
config = require './../../config.js'
base = config.keystone.publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'
_ = require 'underscore'

selectors = {
  header: '#contest-header',
}

getHeaderImage = () ->
  return document.getElementById('contest-header').style.backgroundImage

describe 'Contest page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()
  describe 'Finished-contest page', ->
    describe 'Contest header finished', ->
      it 'exists header image', ->
        casper.thenOpen base + '/concurso/test-contest-finished', ->
          (selectors.header).should.be.inDOM.and.visible
          bgImage = @evaluate getHeaderImage
          isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
          isImage.should.be.not.equal false

    describe 'Finished contest info', ->
      it 'exists finished contest info', ->
        casper.then ->
          '#info'.should.be.inDOM.and.visible
          '#info .status-tag.finished'.should.be.inDOM.and.visible
          '#info .subheader strong'.should.be.inDOM.and.visible

      it 'exists description & awards', ->
        casper.then ->
          '#contest-description'.should.be.inDOM.and.visible
          '#contest-awards.finished'.should.be.inDOM

    describe 'winners', ->
      it 'exists finished contest', ->
        casper.then ->
          '#winners'.should.be.inDOM.and.visible

      it 'exists & works winners links', ->
        casper.then ->
          '.recipe-winner'.should.be.inDOM.and.visible
          '#winners .title'.should.be.inDOM.and.visible
          href = @getElementAttribute '#winners a.recipe-winner', 'href'
          href.should.be.equal '/receta/test-contest-closed-recipe'
          a = @getElementAttribute '#winners .recipe-award a:last-child', 'href'
          a.should.be.equal '/receta/test-contest-closed-recipe'
        casper.then ->
          '#winners .author-winner'.should.be.inDOM.and.visible
          '#winners .user'.should.be.inDOM.and.visible
          href = @getElementAttribute '#winners .author-winner a', 'href'
          href.should.be.equal '/chef/testUser2'
          a = @getElementAttribute('#winners .recipe-award a:first-child',
          'href').should.be.equal '/chef/testUser2'

      it 'exists & works contests award', ->
        casper.then ->
          info = @getElementsInfo '#winners div.award'
          info[0].text.should.be.equal 'premio1'
          info[1].text.should.be.equal 'premio2'

    describe 'Ranking', ->
      it 'exists & works ranking', ->
        casper.then ->
          '#ranking .ranking-module'.should.be.inDOM.and.visible
          '#ranking .ranking-module a.top-contest'.should.be.inDOM.and.visible
          href = @getElementAttribute '.ranking-module a.top-contest', 'href'
          href.should.be.equal '/receta/test-contest-closed-recipe'

      it 'exists & works like counter', ->
        casper.then ->
          likes = @fetchText '#ranking .top-rating.like .like-counter'
          likes.should.be.equal '0'

      it 'exists & works top-info', ->
        casper.then ->
          position = @fetchText '#ranking .ranking-module .top-info strong'
          position.should.be.equal '1# '
          href = @getElementAttribute '.ranking-module .top-info span a', 'href'
          href.should.be.equal '/receta/test-contest-closed-recipe'

      it 'works link to participants list', ->
        casper.then ->
          a = @getElementAttribute '#ranking .chef.button-green a', 'href'
          a.should.be.equal '/concurso/test-contest-finished/participantes/top'

  describe 'Programmed-contest page', ->
    describe 'Contest header programmed', ->
      it 'exists header image', ->
        casper.thenOpen base + '/concurso/test-contest-finished', ->
          (selectors.header).should.be.inDOM.and.visible
          bgImage = @evaluate getHeaderImage
          isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
          isImage.should.be.not.equal false