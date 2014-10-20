var async = require('async'),
  keystone = require('keystone');

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
      var q = Recipes.model.findOne({
        slug: req.params.recipe
      });

      var saveHandler = function(err) {
        if (err) {
          answer.error = true;
        }
        else {
          answer.success = true;
        }
        next(err);
      };

      q.exec(function(err, recipe) {
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
          next(err);
        }
        else {
          var pos = req.user.shopping.indexOf(recipe._id);
          if (req.params.action === 'add') {
            if (recipe.state === 'published') {
              if (pos === -1) {
                req.user.shopping.push(recipe._id);
                req.user.save(saveHandler);
              }
              else {
                answer.success = true;
                next(err);
              }
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
