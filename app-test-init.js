/****************************************************
									TEST ENVIRONMENT
****************************************************/

/*
	Test environment
*/
var _ = require('underscore');

global.__base = __dirname + '/';

require('dotenv').load();

var config = require('./config.js'),
  keystone = require('keystone'),
  i18n = require('i18n');

keystone.testMode = config.keystone.test.enabled;

if (config.keystone.test.enabled) {
  config.keystone.init = _.extend(config.keystone.init, config.keystone.test.init);
  config.keystone['security'] = _.extend(config.keystone['security'], config.keystone.test['security']);
}

keystone.init(config.keystone.init);

keystone.import('models');

keystone.set('locals', {
  _: _,
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable
});

keystone.set('routes', require('./routes'));

keystone.set('email locals', config.keystone['email locals']);
keystone.set('email rules', config.keystone['email rules']);
keystone.set('email tests', require('./routes/emails'));
keystone.set('security', config.keystone['security']);

// Configure i18n
i18n.configure({
  locales: ['es'],
  defaultLocale: 'es',
  directory: __dirname + '/locales'
});

exports = module.exports = keystone;
