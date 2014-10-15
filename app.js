/* APP */

global.__base = __dirname + '/';

var _ = require('underscore'),
  multiline = require('multiline');

require('./utils/stringPrototype');
require('dotenv').load();

var config = require('./config'),
  keystone = require('keystone'),
  i18n = require('i18n'),
  testMode = null;

if (config.keystone.init.env !== 'production') {
  keystone.testMode = config.keystone.test.enabled;

  if (config.keystone.test.enabled) {
    // Load function
    testMode = require('./test/mocha/testMode');

    config.keystone.init = _.extend(config.keystone.init, config.keystone.test.init);
    config.keystone['security'] = _.extend(config.keystone['security'], config.keystone.test['security']);
    console.warn(multiline(function() {
      /*
   _____ _____ ____ _____   __  __  ___  ____  _____
  |_   _| ____/ ___|_   _| |  \/  |/ _ \|  _ \| ____|
    | | |  _| \___ \ | |   | |\/| | | | | | | |  _|
    | | | |___ ___) || |   | |  | | |_| | |_| | |___
    |_| |_____|____/ |_|   |_|  |_|\___/|____/|_____|
  */
    }));
  }
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
keystone.set('security', config.keystone.security);

// Configure i18n
i18n.configure({
  locales: ['es'],
  defaultLocale: 'es',
  directory: __dirname + '/locales'
});

// Configure the navigation bar in Admin UI
keystone.set('nav', {
  'users': 'users',
  'recipes': 'recipes',
  'contests': 'contests',
  'questions': 'questions',
  'tips': 'tips',
  'configs': 'configs'
});

/*
MongoDB Environment:
  MONGODB_DATABASE
  MONGODB_HOST
  MONGODB_PORT
  MONGODB_USERNAME
  MONGODB_PASSWORD
  MONGO_URL
*/

// console.log("MongoDB Connection:\n\
//  DB: " + process.env.MONGODB_DATABASE + "\n\
//  HOST: " + process.env.MONGODB_HOST + "\n\
//  PORT: " + process.env.MONGODB_PORT + "\n\
//  USER: " + process.env.MONGODB_USERNAME + "\n\
//  URL:  " + process.env.MONGO_URL);

keystone.start(function(done) {
  done = done || function() {};

  // Dump database for tests
  if (config.keystone.test.enabled) {
    var tm = testMode(keystone);
    tm.revertDatabase(function(err) {
      tm.getDatabase(function(err, reply) {
        require('fs').writeFile(__dirname + '/test/database.json', JSON.stringify(reply), function(err) {
          return done(err);
        });
      });
    });
  }

  /*
  Elasticsearch Setup
   */
  require(__base + 'services').elastic.sync();
});

exports = module.exports = keystone;
