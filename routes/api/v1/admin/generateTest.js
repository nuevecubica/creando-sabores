var async = require('async'),
  data = require('../../../../test/data.json'),
  _ = require('underscore'),
  answer = {
    success: false,
    error: false
  };

var testMode = function(keystone) {

  if (!keystone) {
    keystone = require('keystone');
  }

  // Return
  var resp = {};

  // Run loaders
  resp.revertDatabase = function(end) {
    keystone.mongoose.connection.db.collections(function getCollections(err, collections) {
      if (!err) {
        // console.log('Collections', collections.length);
        async.each(collections, function(collection, done) {
          var name = collection.collectionName;
          var orig = name.substr(0, name.length - 5);
          if (name === orig + '_orig') {
            keystone.mongoose.connection.db.collection(orig, function getCollection(err, collectionOrig) {
              if (!err) {
                // console.log('Restoring %s', name);
                async.series([

                  function remove(cb) {
                    collectionOrig.remove({}, function(err, reply) {
                      cb(err);
                    });
                  },
                  function insert(cb) {
                    collection.find().toArray(function(err, elems) {
                      if (!err) {
                        async.each(elems, function insertElement(elem, _cb) {
                          // console.log('Inserting %s in %s', elem._id, orig);
                          collectionOrig.insert(elem, function(err, reply) {
                            _cb(err);
                          });
                        }, cb);
                      }
                      else {
                        cb(err);
                      }
                    });
                  }
                ], done);
              }
              else {
                end(err);
              }
            });
          }
          else {
            done();
          }
        }, end);
      }
      else {
        end(err);
      }
    });
  };

  resp.resetDatabase = resp.revertDatabase;

  return resp;
};

module.exports = exports = {
  middleware: function(req, res) {
    testMode(require('keystone')).revertDatabase(function(err) {
      if (err) {
        answer.error = true;
      }
      else {
        answer.success = true;
      }
      return res.apiResponse(answer);
    });
  },
  run: testMode
};
