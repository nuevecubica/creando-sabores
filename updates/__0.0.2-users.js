var keystone = require('keystone'),
	async = require('async'),
	User = keystone.list('User')
	tools = require('../routes/authentication/tools');

function updateUser(user, done) {
	// update user
	// ok? -> done
	if(!user.schemaVersion ||
			user.schemaVersion < process.env.USERS_SCHEMA_VERSION ) {

		// Release
		if(user.media.avatar) {
			user.avatars.local = user.media.avatar;
			user.media.avatar.origin = 1;
		}
		else{
			user.media.avatar.origin = 0;
		}

		// Dev server
		if(user.media.social) {
			if(user.media.social.indexOf('graph.facebook') >= 0) {
				user.avatars.facebook = user.media.social;
				user.media.avatar.origin = 2;
				delete user.media.social;
			}
			else {
				user.avatars.google = user.media.social;
				user.media.avatar.origin = 3;
				delete user.media.social;
			}
		}

		if(user.social.facebook.profileId) {
			delete user.social.facebook.avatar;
			delete user.social.facebook.profileUrl;
		}

		if(user.social.google.profileId) {
			delete user.social.google.avatar;
			delete user.social.google.profileUrl;
		}

		user.username = tools.createUsername(user.name, Math.floor(Math.random() * 899) + 100);
		user.schemaVersion = process.env.USERS_SCHEMA_VERSION;
	}
}

exports = module.exports = function(done) {
	User.model.find({ }, function(err, users) {

		if (err || !user) {
			done(false);
		}
		else {
			async.forEach(users, updateUser, done);
		}
	});
};
