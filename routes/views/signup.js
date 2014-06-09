var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {

	var locals = res.locals,
		view = new keystone.View(req, res);

	// Set locals
	locals.section = 'signup';

	// Render the view
	view.render('signup');
};
