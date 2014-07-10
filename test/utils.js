var keystone = require(__dirname + '/../app-test-init.js');
var config = require(__dirname + '/../config-test.js');
var async = require('async');
var Users = null;

function updateUser(user, done) {
  var fields = ['name', 'email', 'about', 'password', 'media', 'isPrivate', 'isDeactivated'];
  Users.model.findOne({
      username: user.username
    },
    function(err, doc) {
      if (err) {
        console.log('updateUser find ERROR: ', err, user);
        done(true);
      }
      else {
        for (var i = 0, l = fields.length; i < l; i++)  {
          if (fields[i] in user) {
            doc[fields[i]] = user[fields[i]];
          }
        }

        doc.save(function(err) {
          if (err) {
            console.log('updateUser save ERROR: ', err, doc);
          }
          done();
        });
      }
    }
  );
}

function __updateUsers(users, done) {
  Users = keystone.list('User');
  async.forEach(users, updateUser, done);
}

function updateUsers(users, done) {
  if (!keystone.mongoose.connection.readyState) {
    keystone.mongoose.connect(config.keystone.init['mongo url']);
    keystone.mongoose.connection.on('open', function() {
      return __updateUsers(users, done);
    });
  }
  else {
    __updateUsers(users, done);
  }
}

function revertTestUsers(done) {
  updateUsers(config.lists.users, done);
}

exports.updateUser = module.exports.updateUser = updateUser;
exports.updateUsers = module.exports.updateUsers = updateUsers;
exports.revertTestUsers = module.exports.revertTestUsers = revertTestUsers;

// return revertTestUsers(function() {});
