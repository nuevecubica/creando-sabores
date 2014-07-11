/* APP */
var multiline = require('multiline');
require('dotenv').load();

if (!process.env.NODE_ENV) {
  console.error("Warning: Environment variable NODE_ENV not defined.");
  return 1;
  // process.env.NODE_ENV = 'development';
}

var config = require('./config.js'),
  keystone = require('keystone'),
  i18n = require('i18n');

keystone.init(config.keystone.init);

keystone.import('models');

keystone.set('locals', {
  _: require('underscore'),
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
//	DB: " + process.env.MONGODB_DATABASE + "\n\
//	HOST: " + process.env.MONGODB_HOST + "\n\
//	PORT: " + process.env.MONGODB_PORT + "\n\
//	USER: " + process.env.MONGODB_USERNAME + "\n\
//	URL:  " + process.env.MONGO_URL);

if (config.keystone.test.enabled) {
  keystone.init(config.keystone.test.init);
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

keystone.start(function() {
  if (config.keystone.test.enabled) {
    var Users, user, userM, _i, _len, _ref, _results;

    Users = keystone.list('User');

    _ref = require('./test/users.json');

    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      user = _ref[_i];
      userM = new Users.model();
      userM.name = user.name;
      userM.username = user.username;
      userM.email = user.email;
      if (user.password) {
        userM.password = user.password;
      }
      userM.media = user.media;
      userM.save();
    }
  }
});

exports = module.exports = keystone;
