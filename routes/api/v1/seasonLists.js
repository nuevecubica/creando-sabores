var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /seasonLists?limit=1&withRecipes=1
	id=
  page=
  perPage=
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    limit: parseInt(req.query.limit) || null,
    withRecipes: (req.query.withRecipes === "1") || false
  };

  var _call = options.withRecipes ? service.seasonList.recipes.get : service.seasonList.get;

  _call(options, function(err, seasons) {
    if (err || !seasons) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      answer.seasons = seasons;
    }
    return res.apiResponse(answer);
  });
};
