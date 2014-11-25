var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require(__base + 'services');

/*
	/me/shopping/add/slug
*/

exports = module.exports = function(req, res) {

  var Recipes = keystone.list('Recipe'),
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {

      var saveHandler = function(err) {
        if (err) {
          answer.error = true;
          answer.errorMessage = err;
        }
        else {
          answer.success = true;
        }
        next(err);
      };

      var q = service.recipe.get({
        slug: req.params.recipe
      }, function(err, result) {
        var recipe = result.recipe;
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
          next(err);
        }
        else {
          var userIds = req.user.shopping.map(function(a) {
            return a.recipe.toString();
          });
          var pos = userIds.indexOf(recipe._id.toString());
          if (req.params.action === 'add') {
            if (recipe.state === 'published') {
              var myIngredients = req.body.myIngredients ? req.body.myIngredients : [];
              myIngredients = _.intersection(recipe.ingredients, myIngredients);
              var element = {
                recipe: recipe._id,
                myIngredients: myIngredients
              };
              if (pos === -1) {
                req.user.shopping.push(element);
              }
              else {
                req.user.shopping[pos].myIngredients = myIngredients;
              }
              req.user.save(saveHandler);
            }
            else {
              res.status(401);
              answer.error = true;
              next(err);
            }
          }
          else if (req.params.action === 'remove') {
            if (pos !== -1) {
              req.user.shopping.splice(pos, 1);
              req.user.save(saveHandler);
            }
            else {
              answer.success = true;
              next(err);
            }
          }
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
