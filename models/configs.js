var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async');

/**
 * Config
 * =====
 */
var Config = new keystone.List('Config', {
  nodelete: true
});

Config.add({
  name: {
    type: Types.Text,
    initial: true,
    required: true,
    index: true,
    unique: true
  },
  value: {
    type: Types.Text,
    initial: true
  }
});

Config.defaultColumns = 'name, value';
Config.register();
