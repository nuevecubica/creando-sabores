var async = require('async'),
  data = require('../../../../test/data.json'),
  answer = {
    success: false,
    error: false
  };

var testMode = function(keystone) {

  if (!keystone) {
    keystone = require('keystone');
  }

  var Users = keystone.list('User'),
    Recipes = keystone.list('Recipe');

  // End function maker
  var end = function(done, caller) {
    return function(err) {
      if (err) {
        console.error('Error on done from %s: ', caller || 'unknown', err);
      }
      // console.log('Database reset done');
      if (done) {
        return done(err);
      }
      return err;
    };
  };

  // 'drop' destroys the indexes and, while they are
  // regenerating, 'unique' property won't be checked
  var testDrop = function(callback) {
    // console.log('Drop database');
    Recipes.model.collection.drop(function(err1) {
      Users.model.collection.drop(function(err2) {
        if (callback) {
          callback(err1 || err2);
        }
      });
    });
  };

  var testClean = function(callback) {
    // console.log('Clean database');
    Recipes.model.remove({}, function(err1) {
      Users.model.remove({}, function(err2) {
        if (callback) {
          callback(err1 || err2);
        }
      });
    });
  };

  // Load all the users
  var testAdminsAdd = function(done) {
    var add = function(admin, callback) {
      var userM = new Users.model();
      userM.name = admin.name;
      userM.username = admin.username;
      userM.email = admin.email;
      if (admin.password) {
        userM.password = admin.password;
      }
      userM.about = admin.about;
      userM.media = admin.media;
      userM.isAdmin = true;
      userM.save(function(err) {
        // console.log('admin saved', err);
        if (callback) {
          callback(err);
        }
      });
    };

    async.each(data.admins, add, end(done));
  };

  // Load all the users
  var testUsersAdd = function(done) {
    var add = function(user, callback) {
      var userM = new Users.model();
      userM.name = user.name;
      userM.username = user.username;
      userM.email = user.email;
      if (user.password) {
        userM.password = user.password;
      }
      userM.about = user.about;
      userM.media = user.media;
      userM.save(function(err) {
        // console.log('user saved', err);
        if (callback) {
          callback(err);
        }
      });
    };

    async.eachSeries(data.users, add, end(done));
  };

  // Load all the recipes
  var testRecipesAdd = function(done) {
    // console.log('Adding test recipes');
    var users = null;
    var add = function(recipe, callback) {
      var recipeM = new Recipes.model();
      for (var val in recipe) {
        if (val === 'author') {
          recipeM['author'] = users[recipe.author - 1];
        }
        else {
          recipeM[val] = recipe[val];
        }
      }
      recipeM.save(function(err) {
        // console.log('recipe saved', err);
        if (callback) {
          callback(err);
        }
      });
    };
    var usersList = [];
    for (var i = 0, l = data.users.length; i < l; i++) {
      usersList.push(data.users[i].username);
    }

    Users.model.find({
      username: {
        '$in': usersList
      }
    }).sort({
      username: 1
    }).exec(function(err, results) {
      if (err) {
        console.log(err);
      }

      users = results;
      async.each(data.recipes, add, end(done));
    });
  };

  // Return
  var resp = {};

  // Run loaders
  resp.resetDatabase = function(done) {
    async.series([
      testDrop,
      testAdminsAdd,
      testUsersAdd,
      testRecipesAdd
    ], end(done));
  };

  resp.revertDatabase = function(done) {
    async.series([
      testClean,
      testAdminsAdd,
      testUsersAdd,
      testRecipesAdd
    ], end(done));
  };

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
