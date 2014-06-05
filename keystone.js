// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');

keystone.init({

	'name': 'Chefcito',
	'brand': 'Chefcito',

	// 'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',

	'views': 'templates/views',
	'view engine': 'jade',

	'emails': 'templates/emails',

	'auto update': true,

	'session': true,
	'auth': true,
	'user model': 'User',
	'cookie secret': 'r^.s/{!h0?gs.kB*_Z<m4P6diRZ07([O_K[y<*w"Wu;8pm-UoThSiZAT`yt^h@L"',
	'db name': process.env.MONGODB_DATABASE,
	'trust proxy': true

});

keystone.import('models');

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

keystone.set('routes', require('./routes'));

keystone.set('email locals', {
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
});

keystone.set('email rules', [{
	find: '/images/',
	replace: (keystone.get('env') === 'production') ? 'http://www.your-server.com/images/' : 'http://localhost:3000/images/'
}, {
	find: '/keystone/',
	replace: (keystone.get('env') === 'production') ? 'http://www.your-server.com/keystone/' : 'http://localhost:3000/keystone/'
}]);

keystone.set('email tests', require('./routes/emails'));

keystone.set('nav', {
	'users': 'users',
	'recipes': 'recipes'
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
// 	DB: " 	+ process.env.MONGODB_DATABASE + "\n\
// 	HOST: " + process.env.MONGODB_HOST + "\n\
// 	PORT: " + process.env.MONGODB_PORT + "\n\
// 	USER: " + process.env.MONGODB_USERNAME + "\n\
// 	URL:  " + process.env.MONGO_URL);

if (process.env.MONGO_URL) {
    keystone.set('mongo url', process.env.MONGO_URL);
}

keystone.set('host', '0.0.0.0');

if (process.env.PORT) {
   keystone.set('port', process.env.PORT);
}

if (!process.env.NODE_ENV) {
	console.warn("Warning: Environment variable NODE_ENV not defined.");
}

keystone.start();
