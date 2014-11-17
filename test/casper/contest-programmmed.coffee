data = require './../data'
base = require('../utils/casper-config.js').publicUrl
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

  describe 'Programmed-contest page', ->
    describe 'Contest header programmed', ->
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