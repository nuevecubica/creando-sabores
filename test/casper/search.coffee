data = require './../data'
base = require('./config.js').publicUrl  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

describe 'WEB Search', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()


  describe 'Search page', ->
    it 'performs search on all categories', ->
      casper.thenOpen base + '/buscar', ->
        @sendKeys '#search-query', 'test', {keepFocus: true}
        @sendKeys '#search-query', casper.page.event.key.Enter
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        @getCurrentUrl().should.not.contain 'idx'

    it 'filters results on category click', ->
      casper.then ->
        @click '#tab-recipes'
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        urls.map (url) -> url.substring(0,8).should.be.equal '/receta/'
        @getCurrentUrl().should.contain 'idx=recipes'
        @click '#tab-videorecipes'
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        urls.map (url) -> url.substring(0,13).should.be.equal '/videoreceta/'
        @getCurrentUrl().should.contain 'idx=videorecipes'

    it 'goes to previous search on history.back', ->
      casper.back()
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        urls.map (url) -> url.substring(0,8).should.be.equal '/receta/'
        @getCurrentUrl().should.contain 'idx=recipes'
      casper.back()
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        @getCurrentUrl().should.not.contain 'idx'

  describe 'Sections search box', ->
    it 'restricts search to the section', ->
      casper.thenOpen base + '/videorecetas', ->
        @sendKeys '#search-query', 'test', {keepFocus: true}
        @sendKeys '#search-query', casper.page.event.key.Enter
      casper.waitForSelector '#results.loaded', ->
        urls = @getElementsAttribute '#results .list>.row>a', 'href'
        urls.length.should.be.above 3
        urls.map (url) -> url.substring(0,13).should.be.equal '/videoreceta/'
        @getCurrentUrl().should.contain 'idx=videorecipes'
      , null, 10000