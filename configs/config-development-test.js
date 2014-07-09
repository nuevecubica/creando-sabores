/*
	DEVELOPMENT TEST CONFIGURATION
*/
/* APP */
require('dotenv').load();

var answer = {};

answer.keystone = {
  init: {
    'name': 'Chefcito',
    'brand': 'Chefcito',

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
    'db name': process.env.MONGODB_DATABASE ||  'chefcito',
    'trust proxy': true,

    'host': '0.0.0.0',
    'port': '7357',
    'mongo url': process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/chefcito'
  },
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
    replace: 'http://localhost:7357/images/'
  }, {
    find: '/keystone/',
    replace: 'http://localhost:7357/keystone/'
  }],
  'security': {
    'csrf': false
  }
};

answer.lists = {
  users: [{
    name: 'Test User1',
    email: 'testUser1@glue.gl',
    password: 'testUser1',
    username: 'testUser1',
    media: {
      avatar: {
        origin: 'none'
      }
    }
  }, {
    name: 'Test User2',
    email: 'testUser2@glue.gl',
    username: 'testUser2',
    media: {
      avatar: {
        origin: 'none'
      }
    }
  }]
};

answer.url = 'http://' + answer.keystone.init.host + ':' + answer.keystone.init.port;

exports = module.exports = answer;
