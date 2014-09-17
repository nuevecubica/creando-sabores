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
      var page = parseInt(req.query.page) || 1,
        perPage = parseInt(req.query.perPage) || 10,
        first = (page - 1) * perPage,
        last = Math.min(first + perPage, req.user.shopping.length),
        recipeIds = req.user.shopping.slice(first, last + 1);

      keystone.list('Recipe').model.find({
        '_id': {
          $in: recipeIds
        }
      })
        .exec(function(err, recipes) {
          if (err || !recipes) {
            res.status(404);
            answer.error = true;
          }
          else {
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
              last: last - 1
            };
            answer.success = true;
          }
          return next(err);
        });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
