var keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User');

function updateModel(done) {

  // Read them without Mongoose to get the old schema values
  User.model.collection.find({
    schemaVersion: 2
  }, function(err, cursor) {
    if (err) {
      return done(err);
    }

    function processItem(err, item) {
      if (err) {
        return done(err);
      }
      if (item === null) {
        return done();
      }
      var shopping = [];
      if (item.shopping) {
        shopping = item.shopping.map(function(a) {
          return {
            recipe: a,
            myIngredients: []
          };
        });
      }

      User.model.update({
          _id: item._id
        }, {
          $set: {
            'schemaVersion': 3,
            'shopping': shopping
          }
        }, {
          multi: true
        },
        function(err) {
          if (err) {
            return done(err);
          }
          cursor.nextObject(processItem);
        });

    }

    cursor.nextObject(processItem);

  });

}

exports = module.exports = updateModel;
