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

      q.exec(function(err, recipe) {
        if (err || !recipe) {
          res.status(404);
          answer.error = true;
        }
        else {
          var pos = req.user.shopping.indexOf(recipe._id);
          if (req.params.action === 'add') {
            if (pos === -1) {
              req.user.shopping.push(recipe._id);
              req.user.save();
            }
          }
          else if (req.params.action === 'remove') {
            if (pos !== -1) {
              req.user.shopping.splice(pos, 1);
              req.user.save();
            }
          }
          answer.success = true;
        }
        return next(err);
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
