/****************************************************
									TEST ENVIRONMENT
****************************************************/

/*
	It starts a server for testing.
*/
var keystone = require('./app-test-init.js'),
  config = require('./config-test.js');

keystone.start(function() {
  var Users, user, userM, _i, _len, _ref, _results;

  Users = keystone.list('User');

  _ref = config.lists.users;

  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    user = _ref[_i];
    userM = new Users.model();
    userM.name = user.name;
    userM.username = user.username;
    userM.email = user.email;
    userM.password = user.password;
    userM.save();
  }
});
