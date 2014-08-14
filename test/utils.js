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

function generateText(len) {
  var txt = '';
  for (var i = 0; i < len; i++) {
    txt += 'a';
  }
  return txt;
}

function antiRegExp(text, regexp) {
  var antiRE = new RegExp(regexp);
  if (text.match(antiRE) !== null) {
    return "text found: " + regexp;
  }
  return false;
}

exports = module.exports = {
  revertTestUsers: revertTestUsers,
  loginUser: loginUser,
  generateText: generateText,
  antiRegExp: antiRegExp
};
