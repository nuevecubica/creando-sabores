var _ = require('underscore');

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

if (config.keystone.test.enabled) {
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

console.log(config.keystone.init);

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

keystone.start(function() {
  if (config.keystone.test.enabled) {
    var Users, Recipes, user, userM, _i, _len, _ref, _results, usersList = [];

    console.log('Adding test users');
    Users = keystone.list('User');

    _ref = require('./test/data.json');

    for (_i = 0, _len = _ref.users.length; _i < _len; _i++) {
      user = _ref.users[_i];
      userM = new Users.model();
      userM.name = user.name;
      userM.username = user.username;
      userM.email = user.email;
      if (user.password) {
        userM.password = user.password;
      }
      userM.media = user.media;
      userM.save(function(err, user) {
        usersList.push(user.id);
      });
    }

    console.log('Adding test recipes');
    // Change authors
    Recipes = keystone.list('Recipe');
    for (_i = 0, _len = _ref.recipes.length; _i < _len; _i++) {
      recipe = _ref.recipes[_i];
      recipeM = new Recipes.model();
      for (var val in recipe) {
        if (val === 'author') {
          recipeM['author'] = usersList[recipe.author - 1];
        }
        else {
          recipeM[val] = recipe[val];
        }
      }
      recipeM.save();
    }

  }
});

exports = module.exports = keystone;
