var keystone = require('keystone'),
	async = require('async'),
	User = keystone.list('User');

function updateUser(user, done) {
	// update user
	// ok? -> done
}

exports = module.exports = function(done) {
	// get users
	async.forEach(users, updateUser, done);
};
