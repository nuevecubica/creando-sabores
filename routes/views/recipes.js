var keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  var type = locals.type = (req.params.type === 'videoreceta' ? 'videorecipe' : 'recipe');
  locals.section = type + 's';
  if (type === 'videorecipe') {
    locals.subsection = req.params.section ? req.params.section : 'recientes';
  }
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
          var opts = {
            page: req.query.page || 1,
            perPage: 5
          };
          if (type === 'videorecipe') {
            opts.sort = locals.subsection === 'recientes' ? '-publishedDate' : '-rating';
          }
          service.recipeList[type].get(opts, function(err, results) {
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
          service.grid.get({
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
        },
        // Gets season lists (recipes only)
        function(callback) {
          if (type !== 'recipe') {
            return callback(null);
          }
          service.config.get({
            names: ['season_lists_home']
          }, function(err, results) {
            if (!err && results) {
              service.seasonList.recipes.get({
                limit: results[0] ? results[0].value : 1
              }, function(err, results) {
                locals.data.seasons = results.results;
                callback(err);
              });
            }
            else {
              callback(err);
            }
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
