var keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User');

function updateModel(done) {

  User.model.update({
    schemaVersion: 1
  }, {
    favourites: {
      recipes: [],
      tips: []
    },
    schemaVersion: 2
  }, {
    multi: true
  }, function(err, results) {
    if (err) {
      logger.error('Error updating users:', err);
    }
    else {
      logger.log('Updated ' + results + ' users');
    }
    done(err);
  });
}

exports = module.exports = updateModel;
