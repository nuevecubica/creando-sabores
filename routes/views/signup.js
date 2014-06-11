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
			// Check automatic login or duplicated.
			function(cb) {
				// Mail and password
				if (req.body.signup_email && req.body.signup_password) {
					// User exists
					keystone.list('User').model.findOne({ email: req.body.signup_email }, function(err, user) {
						if (err || user) {
							// Try to signin
							var onSuccess = function() {
								// Logged in
								return res.redirect(userHome);
							};
							var onFail = function(e) {
								// Duplicated
								console.error('SIGNUP: Email exists');
								req.flash('error', 'User already exists with that email address.');
								return cb(true);
							};
							keystone.session.signin({ email: req.body.signup_email, password: req.body.signup_password }, req, res, onSuccess, onFail);
						}
						else {
							// User doesn't exist
							return cb(false);
						}
					});
				}
				else {
					// Missing data
					return cb(true);
				}
			},

			// Check missing data
			function(cb) {
				if (!req.body.signup_name || !req.body.signup_email || !req.body.signup_password) {
					console.error('SIGNUP: Missing data');
					req.flash('error', 'Please enter an email, username and password.');
					return cb(true);
				}
				return cb(false);
			},

			// Save to database
			function(cb) {
				var userData = {
					name: req.body.signup_name,
					username: req.body.signup_name,
					email: req.body.signup_email,
					password: req.body.signup_password
				};

				var User = keystone.list('User').model,
					newUser = new User(userData);

				newUser.save(function(err) {
					if (!err) {
						console.log('SIGNUP: User saved to database');
					}
					return cb(err);
				});
			}
		], function(err){
			if (err) {
				return next();
			}

			// Login on signup success
			var onSuccess = function() {
				return res.redirect(userHome);
			};
			var onFail = function(e) {
				console.log('SIGNIN: Fail after register');
				req.flash('error', 'There was a problem signing you in, please try again.');
				return next();
			};
			keystone.session.signin({ email: req.body.signup_email, password: req.body.signup_password }, req, res, onSuccess, onFail);
		});

	});

	// Render the view
	view.render('signup');
};
