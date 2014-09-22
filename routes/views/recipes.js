var keystone = require('keystone'),
  async = require('async'),
  service = require('../../services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'recipes';
  locals.data = {
    recipes: []
  };
  locals.title = res.__('Recipes');

  // load recipes
  view.on('init', function(next) {

    // Query for get order of grid
    async.series([
        // Function for get recipes
        function(callback) {
          service.recipeList.get({
            page: req.query.page || 1,
            perPage: 5
          }, function(err, results) {
            locals.data.recipes = results.results;
            callback(err);
          });
        },
        // Function for get header recipe
        function(callback) {
          service.pageHeader.recipe.get({}, function(err, result) {
            locals.data.header = result;
            callback(err);
          });
        },
        // Function for get recipes grid
        function(callback) {
          service.recipeList.grid.get({}, function(err, results) {
            locals.data.grid = results;
            callback(err);
          });
        },
        // Gets grid orders and sizes
        function(callback) {
          service.config.grid.recipes.get({}, function(err, results) {
            locals.data.order = results.order;
            locals.data.sizes = results.sizes;
            callback(err);
          });
        }
      ],
      function(err) {
        next(err);
      });
  });

  // Render the view
  view.render('recipes');
};
