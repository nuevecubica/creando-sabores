var async = require('async'),
  keystone = require('keystone');

/*
	/me/favourites/add/slug
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

      q.exec(function(err, recipe) {
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
          next(err);
        }
        else {
          answer.success = true;
          var pos = req.user.favourites.recipes.indexOf(recipe._id);
          if (req.params.action === 'add') {
            if (pos === -1) {
              req.user.favourites.recipes.push(recipe._id);
              req.user.save(function(err) {
                next(err);
              });
            }
            else {
              next();
            }
          }
          else if (req.params.action === 'remove') {
            if (pos !== -1) {
              req.user.favourites.recipes.splice(pos, 1);
              req.user.save(function() {
                next(err);
              });
            }
            else {
              next();
            }
          }
        }
      });
    }
  ], function(err) {
    if (err) {
      answer.success = false;
      answer.error = true;
    }

    return res.apiResponse(answer);
  });

};
