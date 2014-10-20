var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async');

/**
 * Config
 * =====
 */
var Email = new keystone.List('Email', {
  nodelete: true
});

Email.add({
  name: {
    type: Types.Text,
    initial: true,
    required: true,
    index: true
  },
  subject: {
    type: Types.Text
  },
  title: {
    type: Types.Text
  },
  body: {
    type: Types.Html,
    wysiwyg: true,
    height: 100
  },
  state: {
    type: Types.Select,
    options: ['draft', 'published'],
    default: 'draft'
  }
});

Email.defaultColumns = 'name, subject, state';
Email.register();
