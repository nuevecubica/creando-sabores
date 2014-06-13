var async = require('async'),
	keystone = require('keystone');

exports = module.exports = function(req, res) {
	var Users = keystone.list('User'),
			query = {
				username: req.query['username'] || req.body.username || null
			},
			answer = {
				success: false,
				error: false,
				query: query
			};

	async.series([
		function(next) {
			if(!query.username) {
				answer.error = true;
				return next(true);
			}
			return next();
		},

		function(next) {
			Users.model.findOne({
						username: query.username
					}, function(err, user) {
						if (err) {
							answer.error = true;
						}
						else if (user) {
							answer.success = true;
							answer.username = user.username;
						}
						return next();
					});
		}
	], function(err) {
		return res.apiResponse(answer);
	});

};
