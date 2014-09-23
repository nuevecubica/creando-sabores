var keystone = require(__dirname + '/../../app-test-init.js');
var config = require(__dirname + '/../../config.js');
var _ = require('underscore');

var testMode = require(__dirname + '/testMode.js');

function revertTestDatabase(done) {
  if (this && this.timeout) {
    this.timeout(10000);
  }
  if (!keystone.mongoose.connection.readyState) {
    // console.warn('Mongoose connection NOT ready');
    keystone.mongoose.connect(config.keystone.test.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      // console.info('Mongoose connection opened');
      return testMode(keystone).revertDatabase(done);
    });
  }
  else {
    return testMode(keystone).revertDatabase(done);
  }
}

function resetTestDatabase(done) {
  if (this && this.timeout) {
    this.timeout(10000);
  }
  if (!keystone.mongoose.connection.readyState) {
    // console.warn('Mongoose connection NOT ready');
    keystone.mongoose.connect(config.keystone.test.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      // console.info('Mongoose connection opened');
      return testMode(keystone).resetDatabase(done);
    });
  }
  else {
    return testMode(keystone).resetDatabase(done);
  }
}

function readTestDatabase(done) {
  if (this && this.timeout) {
    this.timeout(10000);
  }
  if (!keystone.mongoose.connection.readyState) {
    // console.warn('Mongoose connection NOT ready');
    keystone.mongoose.connect(config.keystone.test.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      // console.info('Mongoose connection opened');
      return testMode(keystone).getDatabase(done);
    });
  }
  else {
    return testMode(keystone).getDatabase(done);
  }
}

function getTestData(done) {
  readTestDatabase(function(err, reply) {
    var data = require('../data');
    done(err, _.extend(data, reply));
  });
}

function loginUser(user, request, callback) {
  request.post('/acceso').send({
    'action': 'login',
    'login_email': user.email,
    'login_password': user.password
  }).expect(302).end(function(err, res) {
    callback(err, res);
  });
}

function generateText(len) {
  var txt = '';
  while (len > 0) {
    var s = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);
    txt += s;
    len -= s.length;
  }
  return txt;
}

exports = module.exports = {
  revertTestDatabase: revertTestDatabase,
  resetTestDatabase: resetTestDatabase,
  readTestDatabase: readTestDatabase,
  getTestData: getTestData,
  loginUser: loginUser,
  generateText: generateText
};
