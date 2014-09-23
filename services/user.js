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
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .sort('title');
    return q;
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
              recipes = allRecipes.slice(first, last);
            }
          });
      }
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
      // Return a paginable-like structure
      var totalPages = Math.ceil(userlist.length / perPage);
      var ret = {
        total: userlist.length,
        results: recipes,
        currentPage: page,
        totalPages: totalPages,
        pages: [],
        previous: page > 1 ? page - 1 : false,
        next: page < totalPages ? page + 1 : false,
        first: first + 1,
        last: last
      };
      return callback(null, ret);
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

  service.recipeList.get({
    sort: '-editDate',
    page: options.page || 1,
    perPage: options.perPage || 5,
    fromContests: true,
    userId: options.userId
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
