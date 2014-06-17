var async = require('async'),
	keystone = require('keystone');

var google = require('./services/google');

exports = module.exports = function(req, res, next) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	async.series([
		function(cb) {
			if (!req.user) { return cb(); }

			keystone.session.signout(req, res, function() {
				return cb();
			});
		}
	], function(err) {

		google.authenticateUser(req, res, next, function(err, type) {

			// Define redirects for success and fail responses
			var redirects = {
				success: '/',
				fail: '/acceso'
			};

			// Redirect based on response
			if (err) {
				console.log('[auth.google] - Google authentication failed - ' + JSON.stringify(err));
				return res.redirect(redirects.fail);
			} else {
				console.log('[auth.goole] - Google authentication was successful.');
				return res.redirect(redirects.success);
			}

		});
	});
};