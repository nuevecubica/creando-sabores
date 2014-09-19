var async = require('async'),
  keystone = require('keystone'),
  modelCleaner = require('../../../../utils/modelCleaner.js'),
  _ = require('underscore');

/*
	/me/shopping/add/slug
*/

exports = module.exports = function(req, res) {

  var Recipes = keystone.list('Recipe'),
    answer = {
      success: false,
      error: false
    };

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

  var cleanShoppingList = function(next) {
    getShoppingListQuery(req.user.shopping)
      .exec(function(err, recipes) {
        if (err || !recipes) {
          res.status(404);
          answer.error = true;
          return next(err);
        }
        else {
          req.user.shopping = recipes;
          req.user.save();
          next(null);
        }
      });
  };

  var getShoppingListSlice = function(next) {
    var page = parseInt(req.query.page) || 1,
      perPage = parseInt(req.query.perPage) || 10,
      first = (page - 1) * perPage,
      last = Math.min(first + perPage, req.user.shopping.length),
      recipeIds = req.user.shopping.slice(first, last);

    getShoppingListQuery(recipeIds)
      .exec(function(err, recipes) {
        if (err || !recipes) {
          res.status(404);
          answer.error = true;
        }
        else if (recipes.length !== recipeIds.length) {
          cleanShoppingList(function(err) {
            getShoppingListSlice(next);
          });
        }
        else {
          for (var i = 0, l = recipes.length; i < l; i++) {
            recipes[i] = recipes[i].toObject({
              virtuals: true,
              transform: modelCleaner.transformer
            });
            var ingr = recipes[i].ingredients;
            ingr = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
            recipes[i].ingredients = ingr;
          }
          var totalPages = Math.ceil(req.user.shopping.length / perPage);
          answer.recipes = {
            total: req.user.shopping.length,
            results: recipes,
            currentPage: page,
            totalPages: totalPages,
            pages: [],
            previous: page > 1 ? page - 1 : false,
            next: page < totalPages ? page + 1 : false,
            first: first + 1,
            last: last
          };
          answer.success = true;
        }
        return next(err);
      });
  };

  async.series([
    getShoppingListSlice
  ], function(err) {
    return res.apiResponse(answer);
  });

};
