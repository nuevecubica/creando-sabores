var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
	/me/favourites/list
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  async.series([

    function(next) {
      service.user.favourites.get({
        page: parseInt(req.query.page) || 1,
        perPage: parseInt(req.query.perPage) || 5,
        user: req.user
      }, function(err, recipes) {
        if (!err && recipes) {
          recipes.results = recipes.results.map(function(item, i) {
            return hideMyApi(item, safe.recipe.populated);
          });
          answer.recipes = recipes;
          answer.success = true;
          next(null);
        }
        else {
          answer.error = true;
          next(err);
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });


};
