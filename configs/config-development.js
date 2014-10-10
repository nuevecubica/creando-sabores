var tcpSplit = require('./utils/tcpSplit');
/*
  DEVELOPMENT CONFIGURATION
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
if (process.env.MONGO_URL) {
  answer.mongodb.url = process.env.MONGO_URL;
  answer.mongodb.host = process.env.MONGODB_HOST;
  answer.mongodb.port = process.env.MONGODB_PORT;
}
// DOCKER
else if (process.env.MONGODB_PORT && process.env.MONGODB_PORT.indexOf(':') !== -1) {
  var mongo = tcpSplit(process.env.MONGODB_PORT);
  answer.mongodb.url = 'mongodb://';
  answer.mongodb.url += mongo.host;
  answer.mongodb.url += ':' + mongo.port;
  answer.mongodb.url += '/' + (process.env.MONGODB_DATABASE || 'chefcito');

  answer.mongodb.host = mongo.host;
  answer.mongodb.port = mongo.port;
}

// DOKKU
if (process.env.ELASTICSEARCH_URL) {
  answer.elasticsearch.url = process.env.ELASTICSEARCH_URL;

  answer.elasticsearch.host = answer.elasticsearch.url ? answer.elasticsearch.url.substring(7, answer.elasticsearch.url.indexOf(":") - 1) : "localhost";
  answer.elasticsearch.port = answer.elasticsearch.url ? answer.elasticsearch.url.substring(answer.elasticsearch.url.indexOf(":") + 1) : 9200;
}
// DOCKER
else if (process.env.ELASTICSEARCH_PORT && process.env.ELASTICSEARCH_PORT.indexOf(':') !== -1) {
  var es = tcpSplit(process.env.ELASTICSEARCH_PORT);
  answer.elasticsearch.url = 'http://' + es.host + ':' + es.port;
  answer.elasticsearch.host = es.host;
  answer.elasticsearch.port = es.port;
}

answer.keystone = {
  test: {
    /**
     * Change the value to false or true to force run the server in test mode
     */
    enabled: process.env.APP_TEST === 'true' || false,
    init: {
      'db name': answer.mongodb.db + '-test',
      'mongo': answer.mongodb.url + '-test',
      'view cache': true
    },
    'security': {
      'csrf': false
    }
  },
  init: {
    'name': 'Chefcito',
    'brand': 'Chefcito',

    'env': process.env.NODE_ENV || 'development',

    // 'less': 'public',
    'static': 'public',
    'favicon': 'public/favicon.ico',

    'views': 'templates/views',
    'view engine': 'jade',
    'view cache': false,

    'emails': 'templates/emails',

    'auto update': true,

    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': 'r^.s/{!h0?gs.kB*_Z<m4P6diRZ07([O_K[y<*w"Wu;8pm-UoThSiZAT`yt^h@L"',
    'db name': answer.mongodb.db,
    'trust proxy': true,

    'host': '0.0.0.0',
    'port': process.env.PORT || 3000,
    'mongo': answer.mongodb.url
  },
  'security': {
    'csrf': true
  },
  publicUrl: process.env.APP_PUBLIC_URL || 'http://chefcito.dev01.glue.gl',
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

exports = module.exports = answer;
