var async = require('async'),
	_ = require('underscore');

var passport = require('passport'),
	passportFacebookStrategy = require('passport-facebook').Strategy;

var keystone = require('keystone'),
	User = keystone.list('User');

// Credentials
var credentials = {
	clientID: process.env.FACEBOOK_CLIENT_ID,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	callbackURL: process.env.FACEBOOK_CALLBACK_URL
};

// Authenticate User
exports.authenticateUser = function(req, res, next, callback) {
	// Begin process
	console.log('[social.facebook] - Triggered authentication process' );

	// Set placeholder variables to hold our data
	var data = {
		facebookUser: false, // FB user
		user: false // user
	};

	// Initalise Facebook credentials
	var facebookStrategy = new passportFacebookStrategy(credentials, function(accessToken, refreshToken, profile, done) {
		done(null, {
			accessToken: accessToken,
			profile: profile
		});
	});

	// Pass through authentication to passport
	passport.use(facebookStrategy);

	// Function to process FB response and decide whether we should create or update a user
	var processFBUser = function(facebookUser) {

		data.facebookUser = facebookUser;

		console.log('[social.facebook] - No user signed in, attempting to match via email');

		var email = data.facebookUser.profile.emails;

		if ( !email.length ) {
			console.log('[social.facebook] - No email address detected, creating new user');

			return createUser();
		}

		User.model.findOne({ 'email': _.first(data.facebookUser.profile.emails).value, 'social.facebook.isConfigured': true, 'social.facebook.profileId': data.facebookUser.profile.id }, function(err, user) {

			if (err || !user) {
				console.log('[social.facebook] - No matching user found via email, creating new user');
				return createUser();
			}

			console.log('[social.facebook] - Matched user via email, updating user');
			data.user = user;

			return signinUser();
		});
	};

	// Function to create user
	var createUser = function() {

		console.log('[social.facebook] - Creating user');

		// Define data
		var email = data.facebookUser.profile.emails;

		// Structure data
		var userData = {
			email: email.length ? _.first(data.facebookUser.profile.emails).value : null,
			username: data.facebookUser.profile.username || createUsername(),
			name: {
				first: data.facebookUser.profile.name.givenName,
				last: data.facebookUser.profile.name.familyName
			},
			media: {
				avatar: 'https://graph.facebook.com/' + data.facebookUser.profile.id + '/picture?type=large',
			}
		};

		console.log('[social.facebook] - user create data:', userData );

		// Create user
		data.user = new User.model(userData);

		console.log('[social.facebook] - Created new instance of user');

		return saveUser();
	};

	var saveUser = function() {

		// Save the user data
		console.log('[social.facebook] - Saving user');

		var userData = {
			social: {
				facebook: {
					isConfigured: true,

					profileId: data.facebookUser.profile.id,
					profileUrl: data.facebookUser.profile.profileUrl,
					accessToken: data.facebookUser.accessToken
				}
			}
		};

		console.log('[social.facebook] - user update data:', userData );

		data.user.set(userData);

		data.user.save(function(err) {

			if (err) {
				console.log(err);
				console.log("[social.facebook] - Error saving user");
				return callback(err);

			} else {

				console.log("[social.facebook] - Saved user");

				if ( req.user ) {
					return callback();
				} else {
					return signinUser();
				}
			}
		});
	};

	// Function to sign user
	var signinUser = function() {

		console.log('[social.facebook] - Signing user');

		var onSuccess = function(user) {
			console.log("[social.facebook] - Successfully signed");
			return callback();
		};

		var onFail = function(err) {
			console.log("[social.facebook] - Failed signing in");
			return callback(true);
		};

		keystone.session.signin( String(data.user._id), req, res, onSuccess, onFail);

	};

	// Function to generate an username.
	// First character of name, last name and random number between 0 and 4 last digits of facebook user id.
	var createUsername = function() {
		var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
	      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
	      mapping = {};

		for(var i = 0, j = from.length; i < j; i++ ) {
			mapping[ from.charAt( i ) ] = to.charAt( i );
		}

		var str =	data.facebookUser.profile.name.givenName[0] +
					data.facebookUser.profile.name.familyName +
					Math.floor((Math.random() * parseInt(data.facebookUser.profile.id.substr(data.facebookUser.profile.id.length - 4, data.facebookUser.profile.id.length))) + 1);

		var ret = [];
		for(var x = 0, y = str.length; x < y; x++) {
			var c = str.charAt(x);
			if(mapping.hasOwnProperty( str.charAt(x))) {
				ret.push(mapping[c]);
			 } else {
				ret.push(c);
			}
		}

		return ret.join('').toLowerCase();
	};

	// Facebook passport requires two URLs, authenticate and callback.
	// First time, in authenticate flow we call to facebook request access
	// if request has code params, means callback flow.
	if(_.has(req.query, 'code' )) {
		console.log('[social.facebook] - Callback workflow detected, attempting to process data');

		passport.authenticate('facebook', {
			successRedirect: '/',
			failureRedirect: '/error'
		}, function(err, data, info) {

			if (err || !data) {
				console.log("[social.facebook] - Error retrieving Facebook account data - " + JSON.stringify(err) );
				return callback(true);
			}

			console.log('[social.facebook] - Successfully retrieved Facebook account data, processing');

			return processFBUser(data);

		})(req, res, next);
	} else {
		console.log('[social.facebook] - Authentication workflow detected, attempting to request access');

		passport.authenticate('facebook', {
			scope: [ 'email' ]
		})(req, res, next);
	}

};