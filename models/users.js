var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types;

/**
 * Users
 * =====
 */

var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: false }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Superadmin', note: 'Can access Keystone.' },
	isConfirmed: { type: Boolean, label: 'Confirmed', note: 'Has confirmed email address. Can publish.' },
	isChef: { type: Boolean, label: 'Chef', note: 'An official chef. Admin role.' },
	isBanned: { type: Boolean, label: 'Banned', note: 'Cannot login.' }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});

// Rights to publish
User.schema.virtual('canPublish').get(function() {
	return this.isAdmin || this.isConfirmed || this.isChef;
});

// Rights to admin
User.schema.virtual('canAdmin').get(function() {
	return this.isAdmin || this.isChef;
});

// Rights to login
User.schema.virtual('canLogin').get(function() {
	return !this.isBanned;
});

/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin, isChef, canPublish';
User.register();
