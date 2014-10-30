data = require './../data'
config = require './../../config.js'
base = config.keystone.publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = {
  header: '#recipes-header',
  currentTabLinks: '.transient-tab-content.active .recipe > a',
  firstTabActive: '.tab:first-child .transient-tab-link .active',
  lastTab: '.tab:last-child .transient-tab-link'
  lastTabActive: '.tab:last-child .transient-tab-link .active',
}

getHeaderImage = () ->
  return document.getElementById('recipes-header').style.backgroundImage

describe 'Recipes page', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()

  describe 'Recipes header', ->
    it 'exists header image', ->
      casper.thenOpen base + '/recetas', ->
        (selectors.header).should.be.inDOM.and.visible
        bgImage = @evaluate getHeaderImage
        isImage = (/(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i).test bgImage
        isImage.should.be.not.equal false

  describe 'Transient tabs', ->
    it 'changes content on tab click', ->
      casper.then ->
        selectors.firstTabActive.should.be.inDOM
        defaultLinks = @getElementsAttribute selectors.currentTabLinks, 'href'
        @click selectors.lastTab
        selectors.firstTabActive.should.not.be.inDOM
        selectors.lastTabActive.should.be.inDOM
        currentLinks = @getElementsAttribute selectors.currentTabLinks, 'href'
        defaultLinks.should.not.be.eql currentLinks
