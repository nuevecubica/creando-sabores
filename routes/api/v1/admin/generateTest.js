var async = require('async'),
  _ = require('underscore'),
  answer = {
    success: false,
    error: false
  };

var testMode = function(keystone) {

  if (!keystone) {
    keystone = require('keystone');
  }

  var copyCollection = function(source, dest, callback) {
    dest.remove({}, function cb(err, reply) {
      if (!err) {
        source.find().toArray(function cb(err, elems) {
          if (!err && elems) {
            async.eachSeries(elems, function insertElement(elem, next) {
              // console.log('Inserting %s in %s', elem._id, orig);
              dest.insert(elem, function cb(err, reply) {
                next(err);
              });
            }, callback);
          }
          else {
            callback(err);
          }
        });
      }
      else {
        callback(err);
      }
    });
  };

  // Return
  var resp = {};

  // Run loaders
  resp.revertDatabase = function(end) {
    keystone.mongoose.connection.db.collections(function getCollections(err, collections) {
      if (!err) {
        // console.log('Collections', collections.length);
        async.each(collections, function each(source, next) {
          var sourceName = source.collectionName;
          var destName = sourceName.substr(0, sourceName.length - 5);
          if (sourceName === destName + '_orig') {
            keystone.mongoose.connection.db.collection(destName, function getCollection(err, dest) {
              if (!err) {
                // console.log('Restoring %s', name);
                copyCollection(source, dest, next);
              }
              else {
                next(err);
              }
            });
          }
          else {
            next();
          }
        }, end);
      }
      else {
        end(err);
      }
    });
  };

  resp.resetDatabase = resp.revertDatabase;

  // Run loaders
  resp.getDatabase = function(end) {
    var data = {};
    keystone.mongoose.connection.db.collections(function getCollections(err, collections) {
      if (!err) {
        // console.log('Collections', collections.length);
        async.each(collections, function each(source, next) {
          var sourceName = source.collectionName;
          if (sourceName.indexOf('_orig') === -1) {
            source.find().toArray(function cb(err, reply) {
              if (!err && reply) {
                data[sourceName] = reply;
              }
              next(err);
            });
          }
          else {
            next();
          }
        }, function(err) {
          end(err, data);
        });
      }
      else {
        end(err, data);
      }
    });
<<<<<<< HEAD
  };

  resp.getDatabase = resp.getDatabase;
=======

  };

  // Return
  var resp = {};

  // Run loaders
  resp.resetDatabase = function(done) {
    async.series([
      testDrop,
      testAdminsAdd,
      testUsersAdd,
      testContestsAdd,
      testRecipesAdd,
      testRecipeContests
    ], end(done));
  };

  resp.revertDatabase = function(done) {
    async.series([
      testClean,
      testAdminsAdd,
      testUsersAdd,
      testContestsAdd,
      testRecipesAdd,
      testRecipeContests
    ], end(done));
  };
>>>>>>> data.json: Updated contest data

  return resp;
};

module.exports = exports = {
  middleware: function(req, res) {
    testMode(require('keystone')).revertDatabase(function(err) {
      if (err) {
        answer.error = true;
        answer.errorMessage = err;
      }
      else {
        answer.success = true;
      }
      return res.apiResponse(answer);
    });
  },
  run: testMode
};
