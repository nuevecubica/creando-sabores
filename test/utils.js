var keystone = require(__dirname + '/../app-test-init.js');
var config = require(__dirname + '/../config.js');

var testMode = require(__dirname + '/testMode.js');

function updateUsers(done) {
  if (!keystone.mongoose.connection.readyState) {
    // console.warn('Mongoose connection NOT ready');
    keystone.mongoose.connect(config.keystone.test.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      // console.info('Mongoose connection opened');
      return testMode(keystone, done);
    });
  }
  else {
    return testMode(keystone, done);
  }
}

function revertTestUsers(done) {
  updateUsers(done);
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

exports.revertTestUsers = module.exports.revertTestUsers = revertTestUsers;
exports.loginUser = module.exports.loginUser = loginUser;
