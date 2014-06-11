var keystone = require('keystone'),
	async = require('async');

exports = module.exports = function(req, res) {

	var userHome = '/';

	if (req.user) {
		return res.redirect(userHome);
	}

	var locals = res.locals,
		view = new keystone.View(req, res);

	// Set locals
	locals.section = 'signup';
	locals.form = req.body;

	view.on('post', { action: 'signup' }, function(next) {
		async.series([
			function(cb) {
				if (!req.body.signup_name || !req.body.signup_email || !req.body.signup_password) {
					req.flash('error', 'Please enter a name, email and password.');
					return cb(true);
				}

				return cb();
			},

			function(cb) {
				keystone.list('User').model.findOne({ email: req.body.signup_email }, function(err, user) {
					if (err || user) {
						req.flash('error', 'User already exists with that email address.');
						return cb(true);
					}
					return cb();
				});
			},

			function(cb) {
				var userData = {
					name: req.body.signup_name,
					email: req.body.signup_email,
					password: req.body.signup_password
				};

				var User = keystone.list('User').model,
					newUser = new User(userData);

				newUser.save(function(err) {
					return cb(err);
				});
			}
		], function(err){
			if (err) return next();
			var onSuccess = function() {
				return res.redirect(userHome);
			}
			var onFail = function(e) {
				req.flash('error', 'There was a problem signing you in, please try again.');
				return next();
			}
			keystone.session.signin({ email: req.body.signup_email, password: req.body.signup_password }, req, res, onSuccess, onFail);

		});

	});

	// Render the view
	view.render('signup');
};
