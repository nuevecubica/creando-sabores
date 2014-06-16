/****************************************************
									TEST ENVIRONMENT
****************************************************/

/*
	Test environment
*/

require('dotenv').load();

if (!process.env.NODE_ENV) {
	console.warn('Warning: Environment variable NODE_ENV not defined.');
	process.env.NODE_ENV = 'development';
}

var config = require('./config-' + process.env.NODE_ENV + '-test.js'),
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

keystone.testStart = function(done) {
	keystone.start(function(e){
		return done();
	});
};

exports = module.exports = keystone;