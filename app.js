/* APP */
global.__base = __dirname + '/';
global.logger = require(__base + 'utils/logger')("backend");

require('./utils/stringPrototype');
require('dotenv').load();

var config = require('./config');
var cluster = require('cluster');
var _ = require('underscore');
var multiline = require('multiline');

if (cluster.isMaster) {

  var numCPUs = require('os').cpus().length;

  // Limit number of CPUs for development purposes
  var cpus = numCPUs > config.server.maxCPUs ? config.server.maxCPUs : numCPUs;
  while (cpus--) {
    cluster.fork();
  }

  cluster.on('disconnect', function(worker) {
    logger.error('Worker %s disconnected.', worker.pid);
  });

  cluster.on('exit', function(worker, code, signal) {
    if (worker.suicide) {
      logger.info('Worker %s commited suicide.', worker.pid);
    }
    else {
      logger.error('Worker %s exited with code %d (%s).', worker.pid, code, signal);
    }
    cluster.fork();
  });
}
else {
  var keystone = require('keystone');
  var i18n = require('i18n');
  var testMode = null;

  // require(__base + 'utils/extendKeystone')(keystone);

  if (config.keystone.init.env !== 'production') {
    keystone.testMode = config.keystone.test.enabled;

    if (config.keystone.test.enabled) {
      // Load function
      testMode = require('./test/mocha/testMode');

      config.keystone.init = _.extend(config.keystone.init, config.keystone.test.init);
      config.keystone['security'] = _.extend(config.keystone['security'], config.keystone.test['security']);
      logger.warn("TEST MODE activated");
      console.warn("\n" + multiline(function() {
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

  keystone.set('site', config.keystone.site);

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

  keystone.set('security', config.keystone.security);

  // Configure i18n
  i18n.configure({
    locales: ['es'],
    defaultLocale: 'es',
    directory: __dirname + '/locales'
  });

  // Configure the navigation bar in Admin UI
  keystone.set('nav', {
    'users': ['users'],
    'recipes': ['recipes'],
    'menus': ['menus'],
    'contests': ['contests'],
    'questions': ['questions'],
    'tips': ['tips'],
    'season-lists': ['season-lists'],
    'configs': ['configs']
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

  // logger.log("MongoDB Connection:\n\
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
}
