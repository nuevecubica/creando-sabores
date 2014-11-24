data = require './../data'
base = require('../utils/casper-config.js').publicUrl
utils = require '../utils/casper-editor.coffee'
_ = require 'underscore'

selectors = {
  header: '#contests-header',
}

getHeaderImage = () ->
  return document.getElementById('contests-header').style.backgroundImage

describe 'Contests page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Contests header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/concursos', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false

  describe 'Current contest', ->
    it 'exists all the content in current contest', ->
      casper.then ->
        ('#current-contest').should.be.inDOM.and.visible
        ('#info').should.be.inDOM.and.visible
        ('#current-contest .award.column').should.be.inDOM.and.visible
        ('#info .status-tag').should.be.inDOM.and.visible
        ('#info .header').should.be.inDOM.and.visible
        ('#info .explain').should.be.inDOM.and.visible
        ('#sponsor.explain strong').should.be.inDOM.and.visible
        ('#current-contest .chef.button-brick a').should.be.inDOM.and.visible
    #it 'works contests award', ->
      #casper.then ->
        #info = @getElementsInfo('#info div.award');
        #info[0].text.should.be.equal 'premio1';
        #info[1].text.should.be.equal 'premio2';
    it 'works status-tag', ->
      casper.then ->
        classes = @getElementAttribute('#info .status-tag', 'class').split(' ')
        _.intersection(classes, ['programmed','votes',
          'submission']).should.be.not.empty
    it 'works link to recipes list', ->
      casper.then ->
        options = ['/concurso/test-contest-programmed',
          '/concurso/test-contest-votes',
          '/concurso/test-contest-submission']
        selector = '#current-contest .chef.button-brick a'
        link = @getElementAttribute(selector, 'href')
        options.indexOf(link).should.be.above -1

  describe 'finished contest', ->
    it 'exists finished contest', ->
      casper.then ->
        ('#past-contests').should.be.inDOM.and.visible
        ('#past-contests .contest-title a').should.be.inDOM.and.visible
        @getElementAttribute('#past-contests .contest-title a',
          'href').should.be.equal '/concurso/test-contest-finished-5'
    it 'works finished contest', ->
      casper.then ->
        ('#past-contests .award').should.be.inDOM.and.visible
        ('#past-contests .author-winner a').should.be.inDOM.and.visible
        @getElementAttribute('#past-contests .author-winner a',
          'href').should.be.equal '/chef/testuser1'
        @getElementAttribute('#past-contests .recipe-award>a',
          'href').should.be.equal '/chef/testuser1'
        @getElementAttribute('#past-contests .recipe-award .title a',
          'href').should.be.equal '/receta/test-contest-finished-recipe-15'
        ('#past-contests div.award').should.be.inDOM.and.visible
    it 'works contests award2', ->
      casper.then ->
        info2 = @getElementsInfo('#past-contests div.award')
        info2[0].text.should.be.equal 'premio1'
        info2[1].text.should.be.equal 'premio2'