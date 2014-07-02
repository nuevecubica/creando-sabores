var keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User');

var admins = [{
  username: 'admin',
  email: 'user@keystonejs.com',
  password: 'admin',
  name: 'Admin User'
}];

function createAdmin(admin, done) {

  var newAdmin = new User.model(admin);

  newAdmin.isAdmin = true;
  newAdmin.save(function(err) {
    if (err) {
      console.error("Error adding admin " + admin.email + " to the database:");
      console.error(err);
    }
    else {
      console.log("Added admin " + admin.email + " to the database.");
    }
    done();
  });

}

exports = module.exports = function(done) {
  async.forEach(admins, createAdmin, done);
};
