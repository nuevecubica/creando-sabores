var async = require('async'),
  data = require('./data.json');

var testMode = function(keystone, done) {

  var Users = keystone.list('User'),
    Recipes = keystone.list('Recipe');

  var testClean = function(callback) {
    Users.model.collection.drop(function(err) {
      Recipes.model.collection.drop(function(err) {
        callback(err);
      });
    });
  };

  // Load all the users
  var testAdminsAdd = function(callback) {
    // console.log('Adding test admins');
    var end = function(err) {
      // console.log('admins end');
      callback();
    };
    var add = function(admin, callback) {
      var userM = new Users.model();
      userM.name = admin.name;
      userM.username = admin.username;
      userM.email = admin.email;
      if (admin.password) {
        userM.password = admin.password;
      }
      userM.media = admin.media;
      userM.isAdmin = true;
      userM.save(function(err) {
        // console.log('admin saved', err);
        callback();
      });
    };

    async.each(data.admins, add, end);
  };

  // Load all the users
  var testUsersAdd = function(callback) {
    // console.log('Adding test users');
    var end = function(err) {
      // console.log('users end');
      callback();
    };
    var add = function(user, callback) {
      var userM = new Users.model();
      userM.name = user.name;
      userM.username = user.username;
      userM.email = user.email;
      if (user.password) {
        userM.password = user.password;
      }
      userM.media = user.media;
      userM.save(function(err) {
        // console.log('user saved', err);
        callback();
      });
    };

    async.eachSeries(data.users, add, end);
  };

  // Load all the recipes
  var testRecipesAdd = function(callback) {
    // console.log('Adding test recipes');
    var users = null;
    var end = function(err) {
      // console.log('recipes end');
      callback();
    };
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
        callback();
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
      async.each(data.recipes, add, end);
    });
  };

  // Run loaders
  var end = function(err) {
    // console.log('done');
    if (done) {
      done(err);
    }
  };

  async.series([
    testClean,
    testAdminsAdd,
    testUsersAdd,
    testRecipesAdd
  ], end);
};

module.exports = exports = testMode;
