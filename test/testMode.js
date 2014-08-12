var async = require('async'),
  data = require('./data.json');

var testMode = function(keystone) {
    var user, recipe, _i, _len, _results, usersList = [];

    var Users = keystone.list('User'),
      Recipes = keystone.list('Recipe');

    var testClean = function(callback) {
      Users.model.collection.drop(function(err){
        Recipes.model.collection.drop(function(err){
          callback(err);
        })
      })
    };

    // Load all the users
    var testUsersAdd = function(callback) {
      console.log('Adding test users');
      var end = function(err, results) {
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

      async.map(data.users, add, end);
    };

    // Load all the recipes
    var testRecipesAdd = function(callback) {
      console.log('Adding test recipes');
      var users = null;
      var end = function(err, results) {
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
      Users.model.find().sort('+name').exec(function(err, results) {
        if (err) {
          console.log(err);
        }

        users = results;
        async.map(data.recipes, add, end);
      });
    };

    // Run loaders
    var end = function(err) {
      // console.log('done');
    };

    async.series([
      testClean,
      testUsersAdd,
      testRecipesAdd
    ], end);
};

module.exports = exports = testMode;