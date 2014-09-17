var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore');

/*
	/recipe/slug/like
*/

exports = module.exports = function(req, res) {

  var Recipes = keystone.list('Recipe'),
    answer = {
      success: false,
      error: false,
    };

  async.series([

    function(next) {
      var q = Recipes.model.findOne({
        'slug': req.params.recipe
      });
      q.exec(function(err, recipe) {
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
        }
        else {
          var pos = req.user.likes.indexOf(recipe._id);
          if (!recipe.likes) {
            recipe.likes = 0;
          }
          if (req.params.action === 'like') {
            if (pos === -1) {
              req.user.likes.push(recipe._id);
              req.user.save();
              recipe.likes += 1;
              recipe.save();
            }
          }
          else if (req.params.action === 'unlike') {
            if (pos !== -1) {
              req.user.likes.splice(pos, 1);
              req.user.save();
              recipe.likes -= 1;
              recipe.save();
            }
          }
          answer.likes = recipe.likes;
          answer.success = true;
        }
        return next(err);
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
