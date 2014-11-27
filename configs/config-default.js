// For testing purposes
var __base = __base || '../'; // jshint ignore:line

var tcpSplit = require(__base + 'utils/tcpSplit');

var ln = require("ln");
var util = require("util");

// CASPER
var env = null;
if ('undefined' === typeof process) {
  env = require('system').env;
}
else {
  env = process.env;
}

/*
  DEFAULT CONFIGURATION
*/

var answer = {
  mongodb: {
    host: 'localhost',
    port: 27017,
    db: 'chefcito',
    url: 'mongodb://localhost:27017/chefcito'
  },
  elasticsearch: {
    host: 'localhost',
    port: 9200,
    url: 'http://localhost:9200',
    log: 'error'
  }
};

// DOKKU
if (env.MONGO_URL) {
  answer.mongodb.url = env.MONGO_URL;
  answer.mongodb.host = env.MONGODB_HOST;
  answer.mongodb.port = env.MONGODB_PORT;
}
// DOCKER
else if (env.MONGODB_PORT && env.MONGODB_PORT.indexOf(':') !== -1) {
  var mongo = tcpSplit(env.MONGODB_PORT);
  answer.mongodb.url = 'mongodb://';
  answer.mongodb.url += mongo.host;
  answer.mongodb.url += ':' + mongo.port;
  answer.mongodb.url += '/' + (env.MONGODB_DATABASE || 'chefcito');

  answer.mongodb.host = mongo.host || answer.mongodb.host;
  answer.mongodb.port = mongo.port || answer.mongodb.port;
}

// DOKKU
if (env.ELASTICSEARCH_URL) {
  answer.elasticsearch.url = env.ELASTICSEARCH_URL;

  var es = tcpSplit(env.ELASTICSEARCH_URL);
  answer.elasticsearch.host = es.host || answer.elasticsearch.host;
  answer.elasticsearch.port = es.port || answer.elasticsearch.port;
}
// DOCKER
else if (env.ELASTICSEARCH_PORT && env.ELASTICSEARCH_PORT.indexOf(':') !== -1) {
  var es = tcpSplit(env.ELASTICSEARCH_PORT); // jshint ignore:line
  answer.elasticsearch.url = 'http://' + es.host + ':' + es.port;
  answer.elasticsearch.host = es.host || answer.elasticsearch.host;
  answer.elasticsearch.port = es.port || answer.elasticsearch.port;
}

answer.keystone = {
  test: {
    /**
     * Change the value to false or true to force run the server in test mode
     */
    enabled: env.APP_TEST === 'true' || false,
    init: {
      'db name': answer.mongodb.db + '-test',
      'mongo': answer.mongodb.url + '-test',
      'view cache': false,
      'mandrill api key': env.MANDRILL_TEST_API_KEY || null
    },
    'security': {
      'csrf': false
    }
  },
  init: {
    'name': 'Chefcito',
    'brand': 'Chefcito',

    'env': env.NODE_ENV || 'development',

    // 'less': 'public',
    // 'static': 'public',
    'favicon': 'public/favicon.ico',

    'views': 'templates/views',
    'view engine': 'jade',
    'view cache': false,

    'emails': 'templates/emails',

    'auto update': true,

    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': '~ ¡n the gr3at |2estaurant of !1fe, there @re those wh0 Eat &nd those wHo get ea7en. ~',
    'hash salt': 'This chick3n is so undercœked that a sk¡ll3d vet could still save ¡t!',
    'db name': answer.mongodb.db,
    'trust proxy': true,

    'host': '0.0.0.0',
    'port': env.PORT || 3000,
    'mongo': answer.mongodb.url,
    'mandrill api key': env.MANDRILL_API_KEY || null,

    'static options': {}
  },
  'security': {
    'csrf': true
  },
  site: {
    name: 'Creando Sabores',
    email: 'contacto@creandosabores.com',
    url: env.APP_PUBLIC_URL || 'http://0.0.0.0:3000',
    twitter: '@creandoSabores',
    brand: 'Creando Sabores',
    fb_app_id: '123456789012345',
    fb_url: 'https://www.facebook.com/creandosabores'
  },
  publicUrl: env.APP_PUBLIC_URL || 'http://chefcito.dev01.glue.gl',
  'email locals': {
    logo_src: '/images/logo-email.gif',
    logo_width: 194,
    logo_height: 76,
    theme: {
      email_bg: '#f9f9f9',
      link_color: '#2697de',
      buttons: {
        color: '#fff',
        background_color: '#2697de',
        border_color: '#1a7cb7'
      }
    }
  },
  'email rules': [{
    find: '/images/',
    replace: 'http://localhost:3000/images/'
  }, {
    find: '/keystone/',
    replace: 'http://localhost:3000/keystone/'
  }]
};

answer.keystone.publicUrl = answer.keystone.site.url;
answer.keystone['email locals'].site = answer.keystone.site;
answer.keystone['email locals'].host = answer.keystone.site.url;

answer.server = {
  maxCPUs: 999
};

answer.logger = {
  level: "debug",
  path: "./logs/"
};

answer.logger.appendersLevel = function(level, path) {
  return {
    backend: [{
      "level": level,
      "type": "file",
      "path": "[./logs/" + process.env.NODE_ENV + ".backend.log.]YYMMDD",
      "isUTC": true
    }, {
      "level": level,
      "type": "console",
      "formatter": function(json) { //define your formatter function in "format" attribute
        return util.format("[%s] [%s] [%s] - %s", json.t, ln.LEVEL[json.l], json.n, json.m);
      }
    }],
    frontend: [{
      "level": level,
      "type": "file",
      "path": "[" + path + process.env.NODE_ENV + ".frontend.log.]YYMMDD",
      "isUTC": true
    }],
    default: [{
      "level": level,
      "type": "file",
      "path": "[" + path + process.env.NODE_ENV + ".default.log.]YYMMDD",
      "isUTC": true
    }]
  };
};

answer.logger.appenders = answer.logger.appendersLevel(answer.logger.level, answer.logger.path);

exports = module.exports = answer;
