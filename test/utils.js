var keystone = require(__dirname + '/../app-test-init.js');
var config = require(__dirname + '/../config.js');

var testMode = require(__dirname + '/testMode.js');

var data = require(__dirname + '/data.json');
var async = require('async');
var Users = null;

function updateUsers(done) {
  if (!keystone.mongoose.connection.readyState) {
    keystone.mongoose.connect(config.keystone.test.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      return testMode(keystone, done);
    });
  }
  else {
    testMode(keystone, done);
  }
}

function revertTestUsers(done) {
  updateUsers(done);
}

exports.revertTestUsers = module.exports.revertTestUsers = revertTestUsers;
