var keystone = require(__dirname + '/../app-test-init.js');
var config = require(__dirname + '/../config-test.js');
var async = require('async');
var Users = null;

function revertUsers() {
  if (!keystone.mongoose.connection.readyState) {
    keystone.mongoose.connect('127.0.0.1', 'chefcito');
    keystone.mongoose.connection.on('open', update);
  }
  else {
    update();
  }
}

function update() {
  Users = keystone.list('Users');
  async.forEach(config.lists.users, revertUser, done);
}

function revertUser(user, done) {
  Users.model.findOne({
      username: user.username
    },
    function(err, doc) {
      if (err) {
        console.log('revertUsers ERROR: ', err);
      }

      doc.name = user.name;
      doc.email = user.email;

      if (user.password) {
        doc.password = user.password;
      }
      console.log('reverting ' + user.username + ' to ' + user.name);
      doc.save(function(err) {
        if (err) {
          console.log('revertUsers ERROR: ', err);
        }
        done();
      });
    }
  );
}

exports.revertUsers = revertUsers;

// revertUsers(function(){});