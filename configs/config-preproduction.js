/*
	PREPRODUCTION CONFIGURATION
*/
var answer = {
  keystone: {
    init: {
      'name': 'Chefcito',
      'brand': 'Chefcito',

      // 'less': 'public',
      'static': 'public',
      'favicon': 'public/favicon.ico',

      'views': 'templates/views',
      'view engine': 'jade',
      'view cache': true,

      'emails': 'templates/emails',

      'auto update': true,

      'session': true,
      'session store': 'mongo',
      'auth': true,
      'user model': 'User',
      'cookie secret': 'r^.s/{!h0?gs.kB*_Z<m4P6diRZ07([O_K[y<*w"Wu;8pm-UoThSiZAT`yt^h@L"',
      'db name': process.env.MONGODB_DATABASE,
      'trust proxy': true,

      'host': '0.0.0.0',
      'port': process.env.PORT || 3000,
      'mongo url': process.env.MONGO_URL ||  null
    },
    'security': {
      'csrf': true
    },
    test: {
      enabled: process.env.APP_TEST === 'true' || false,
      init: {
        'db name': (process.env.MONGODB_DATABASE || "chefcito") + '-test',
        'mongo url': (process.env.MONGO_URL || "mongodb://localhost:27017/chefcito") + '-test'
      },
      'security': {
        'csrf': false
      }
    },
    publicUrl: process.env.APP_PUBLIC_URL ||  'http://clubgibaja.byglue.me',
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
  }
};

exports = module.exports = answer;
