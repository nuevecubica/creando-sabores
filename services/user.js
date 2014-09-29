var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  modelCleaner = require('../utils/modelCleaner.js'),
  service = require('./index');

/**
 * Reads the user's shopping list from the database
 * @param  {Object}   options { field: null, user: null, page: 1, perPage: 10 }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getUserList = function(options, callback) {

  options = _.defaults(options || {}, {
    field: null,
    user: null,
    page: 1,
    perPage: 10
  });

  var getUserListQuery = function(ids) {
    var q = keystone.list('Recipe').model.find({
        '_id': {
          $in: ids
        }
      })
      .where('state', 'published')
      .sort('title');
    return q;
  };

  var sortRecipes = function(recipes, recipeIds, done) {
    // We got the recipes (one way or another...)
    // Fix the ingredient list
    for (var i = 0, l = recipes.length; i < l; i++) {
      recipes[i] = recipes[i].toObject({
        virtuals: true,
        transform: modelCleaner.transformer
      });
      var ingr = recipes[i].ingredients;
      ingr = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
      recipes[i].ingredients = ingr;
    }
    // Sort it in the same order as our list, or order will be block-level
    var recipes2 = [];
    var recipeIdsStr = _.map(recipeIds, String);
    var recipesStr = _.map(recipes, function(r) {
      return String(r._id);
    });

    for (i = 0, l = recipes.length; i < l; i++) {
      var pos = recipeIdsStr.indexOf(recipesStr[i]);
      recipes2[pos] = recipes[i];
    }

    recipes = recipes2;
    // Return a paginable-like structure
    var total = userlist.length,
      totalPages = Math.ceil(total / perPage),
      ret = {
        total: total,
        currentPage: page,
        totalPages: totalPages,
        pages: [],
        previous: page > 1 ? page - 1 : false,
        next: page < totalPages ? page + 1 : false,
        first: first + 1,
        last: last
      };
    ret.results = recipes;
    done(null, ret);
  };

  var page = options.page || 1,
    perPage = options.perPage || 10,
    first = (page - 1) * perPage;

  if (!options.user) {
    return callback('Not allowed', null);
  }

  if (!options.field) {
    return callback('Bad request', null);
  }

  var userlist = options.user[options.field];
  var last = Math.min(first + perPage, userlist.length);
  var recipeIds = userlist.slice(first, last);

  getUserListQuery(recipeIds)
    .exec(function(err, recipes) {

      if (err || !recipes) {
        return callback(err || 'Not found', null);
      }
      else if (recipes.length !== recipeIds.length) {
        // One or more recipes disapeared. Update triggered.
        getUserListQuery(userlist)
          .exec(function(err, allRecipes) {

            if (err || !allRecipes) {
              return callback(err || 'Not found', null);
            }
            else {
              options.user[options.field] = allRecipes;
              options.user.save();
              userlist = _.map(allRecipes, function(recipe) {
                return recipe._id;
              });
              last = Math.min(first + perPage, userlist.length);
              recipes = allRecipes.slice(first, last);
              recipeIds = userlist.slice(first, last);
            }

            sortRecipes(recipes, recipeIds, callback);
          });
      }
      else {
        sortRecipes(recipes, recipeIds, callback);
      }
    });
};

var getShoppingList = function(options, callback) {
  options.field = 'shopping';
  return getUserList(options, callback);
};

var getFavouritesList = function(options, callback) {
  options.field = 'favourites';
  return getUserList(options, callback);
};

var getUserByUsername = function(options, callback) {
  options = options || {};

  User.model.findOne({
    username: options.username
  }, callback);
};

var getUserRecipeList = function(options, callback) {

  options = options || {};

  service.recipeList.recipe.get({
    sort: '-editDate',
    page: options.page || 1,
    perPage: options.perPage || 5,
    fromContests: true,
    user: options.user,
    authorId: options.authorId,
  }, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getUserByUsername,
  shopping: {
    get: getShoppingList
  },
  favourites: {
    get: getFavouritesList
  },
  recipeList: {
    get: getUserRecipeList
  }
};

_service.get.byUsername = getUserByUsername;

exports = module.exports = _service;
