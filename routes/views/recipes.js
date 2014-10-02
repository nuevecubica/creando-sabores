var keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  var type = locals.type = (req.params.type === 'videoreceta' ? 'videorecipe' : 'recipe');
  locals.section = type + 's';
  locals.data = {
    recipes: []
  };
  locals.title = (type === 'recipe' ? res.__('Recipes') : res.__('Videorecipes'));

  // load recipes
  view.on('init', function(next) {

    // Query for get order of grid
    async.series([
        // Function for get recipes
        function(callback) {
          service.recipeList[type].get({
            page: req.query.page || 1,
            perPage: 5
          }, function(err, results) {
            locals.data.recipes = results.results;
            callback(err);
          });
        },
        // Function for get header recipe
        function(callback) {
          service.pageHeader[type].get({}, function(err, result) {
            locals.data.header = result;
            callback(err);
          });
        },
        // Function for get recipes grid
        function(callback) {
          service.recipeList.grid.get({
            section: (type === 'videorecipe' ? 'Videorecipes' : 'Recipes')
          }, function(err, results) {
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
  view.render(type + 's');
};
