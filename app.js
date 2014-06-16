// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();
if (!process.env.NODE_ENV) {
	console.warn("Warning: Environment variable NODE_ENV not defined.");
	process.env.NODE_ENV = 'development';
}

var config = require('./config-' + process.env.NODE_ENV + '.js'),
		keystone = require('keystone');

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
//	DB: " + process.env.MONGODB_DATABASE + "\n\
//	HOST: " + process.env.MONGODB_HOST + "\n\
//	PORT: " + process.env.MONGODB_PORT + "\n\
//	USER: " + process.env.MONGODB_USERNAME + "\n\
//	URL:  " + process.env.MONGO_URL);

keystone.start();

exports = module.exports = keystone;