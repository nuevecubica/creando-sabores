var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore');

/*
	/recipes?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var Recipes = keystone.list('Recipe'),
    query = {
      paginate: {
        page: req.query.page || 1,
        perPage: req.query.perPage || 10
      }
    },
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {
      var q = Recipes.paginate(query.paginate)
        .where('state', 1)
        .where('isBanned', false)
        .where('isRemoved', false)
        .sort('-rating');

      q.exec(function(err, recipes) {
        //console.log('EXEC ' + JSON.stringify(recipes));

        if (err || !recipes) {
          //console.log('ERROR ' + err);
          res.status(404);
          answer.error = true;
        }
        else if (recipes.total > 0) {
          //console.log('RECIPES ' + recipes);
          answer.success = true;

          /*

          This is a terrible solution but it works. It should be
          done including virtuals when exporting to JSON, but it
          crashes with:
            TypeError: Converting circular structure to JSON

          */
          var cleanRecipes = [];
          _.each(recipes.results, function(e, i) {
            var ne = e.toObject();
            ne.thumb = {
              'list': e._.header.src({
                transformation: 'list_thumb'
              }),
              'grid_small': e._.header.src({
                transformation: 'grid_small_thumb'
              }),
              'grid_medium': e._.header.src({
                transformation: 'grid_medium_thumb'
              }),
              'grid_large': e._.header.src({
                transformation: 'grid_large_thumb'
              }),
              'header': e._.header.src({
                transformation: 'header_thumb'
              })
            };
            cleanRecipes.push(ne);
          });
          recipes.results = cleanRecipes;
          answer.recipes = recipes;
        }
        return next(err);
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
