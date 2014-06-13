var async = require('async'),
	keystone = require('keystone');

exports = module.exports = function(req, res) {
	var Users = keystone.list('User'),
			query = {
				email: req.body.email || null,
				password: req.body.password || null
			},
			answer = {
				success: false,
				error: false
			};

	async.series([
		function(next) {
			// Mail and password
			if (query.email && query.password) {

				var onSuccess = function() {
					// Logged in
					answer.success = true;
					return next(false);
				};
				var onFail = function(e) {
					// Failed
					answer.success = false;
					return next(true);
				};

				keystone.session.signin({
					email: query.email, password: query.password
				}, req, res, onSuccess, onFail);
			}
			else {
				// Missing data
				answer.error = true;
				return next(true);
			}
		}
	], function(err) {
		return res.apiResponse(answer);
	});

};
