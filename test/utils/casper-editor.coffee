data = require './../data.js'
base = 'http://localhost:3000'  # We're outside node, so no keystone

# Augment the casper object with some new helpers
casper.editorGetValues = (selectors) ->
  values = []
  for selector, i in selectors
    values[i] = @fetchText selector
  return values

casper.editorClear = (selectors) ->
  @evaluate (selectors) ->
    $.each selectors, (i, selector) ->
      $(selector).html('')
  , selectors

casper.editorTypeInto = (selectors, values) ->
  for selector, i in selectors
    @sendKeys selector, values[i], {reset: true}

casper.editorCheckValues = (selectors, values) ->
  for selector, i in selectors
    selector.should.have.text values[i]


# Export our own helpers
revertDB = () ->
  casper.then ->
    this.page.cookies = []
  casper.thenOpen base + '/acceso', ->
    @fill 'form[action="acceso"]', {
      'action': 'login'
      'login_email': data.admins[0].email
      'login_password': data.admins[0].password
    }, true
  casper.thenOpen base + '/api/v1/admin/generate/test', ->
    this.page.cookies = []

exports = module.exports = {
  revertDB: revertDB
}
