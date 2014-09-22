var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  modelCleaner = require('../utils/modelCleaner.js');

/**
 * Reads the user's shopping list from the database
 * @param  {Object}   options { user: null, page: 1, perPage: 10 }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getShoppingList = function(options, callback) {

  options = _.defaults(options || {}, {
    user: null,
    page: 1,
    perPage: 10
  });

  var getShoppingListQuery = function(ids) {
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

  var last = Math.min(first + perPage, options.user.shopping.length);
  var recipeIds = options.user.shopping.slice(first, last);

  getShoppingListQuery(recipeIds)
    .exec(function(err, recipes) {
      if (err || !recipes) {
        return callback(err || 'Not found', null);
      }
      else if (recipes.length !== recipeIds.length) {
        // One or more recipes disapeared. Update triggered.
        getShoppingListQuery(options.user.shopping)
          .exec(function(err, allRecipes) {
            if (err || !allRecipes) {
              return callback(err || 'Not found', null);
            }
            else {
              options.user.shopping = allRecipes;
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
      var totalPages = Math.ceil(options.user.shopping.length / perPage);
      var ret = {
        total: options.user.shopping.length,
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

/*
  Set exportable object
 */
var servicesUser = {
  shopping: {}
};
servicesUser.shopping.get = getShoppingList;

exports = module.exports = servicesUser;
