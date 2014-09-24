data = require './../data'
base = 'http://localhost:3000'  # We're outside node, so no keystone
utils = require '../utils/casper-editor.coffee'

selectors = [
  '#recipe-title',
  '#recipe-time .set-editable',
  '#recipe-portions .set-editable',
  '#recipe-description .set-editable'
]

newValues = [
  'Dummy New Title',
  '15',
  '4',
  'Dummy New Description'
]

oldValues = null

describe 'WEB Recipe Edit', ->
  @timeout 60000

  before (done) ->
    casper.start base, ->
      # Do Nothing.
    utils.revertDB()
    casper.thenOpen base + '/acceso', ->
      @fill 'form[action="acceso"]', {
        'action': 'login'
        'login_email': data.users[0].email
        'login_password': data.users[0].password
      }, true

  describe 'Recipe page - Basics', ->
    it 'enters editable mode on edit click', ->
      casper.thenOpen base + '/receta/' + data.db.recipes[4].slug, ->
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        'div[contenteditable="true"]'.should.not.be.inDOM
        @click '.menu #edit'
        '#manage-wrapper'.should.not.be.visible
        'body.mode-editable'.should.be.inDOM
        for selector in selectors
          (selector + '[contenteditable="true"]').should.be.inDOM

    it 'allows edition in editable mode', ->
      casper.then ->
        # Text fields
        oldValues = @editorGetValues selectors
        @editorClear selectors
        @editorTypeInto selectors, newValues
        @editorCheckValues selectors, newValues
        # Other fields
        @click '#recipe-difficulty'
        @click '#recipe-difficulty .options .item:first-child'
        '#recipe-difficulty .itemSelected .item[data-value="1"]'.should.be.inDOM

    it 'ignores non-numbers on number fields', ->
      casper.then ->
        numselectors = selectors.slice(1,3)
        numvalues = ['-a4.5b', '-3.b']
        numexpected = ['45', '3']
        @editorClear numselectors
        @editorTypeInto numselectors, numvalues
        @editorCheckValues numselectors, numexpected

    it 'reverts changes on cancel', ->
      casper.then ->
        @click '#cancel'
        '#manage-wrapper'.should.be.visible
        'body.mode-editable'.should.not.be.inDOM
        'div[contenteditable="true"]'.should.not.be.inDOM
        @editorCheckValues selectors, oldValues

    it 'saves changes on save', ->
      casper.then ->
        @click '.menu #edit'
        @editorClear selectors
        @editorTypeInto selectors, newValues
        @click '#update'
      casper.waitForSelector '#messages .message.success', ->
        @editorCheckValues selectors, newValues
        utils.revertDB()
