var keystone = require('keystone'),
  async = require('async');

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

    // Query for get recipes for list
    var queryRecipes = keystone.list('Recipe')
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .where('contest.id', null)
      .sort('-rating');

    // Query for get header promoted recipe
    var queryHeader = keystone.list('Recipe')
      .paginate({
        page: 1,
        perPage: 1
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .where('isRecipesHeaderPromoted', true)
      .sort('-publishedDate');

    // Query for get recipes for grid
    var queryGrid = keystone.list('Recipe')
      .paginate({
        page: 1,
        perPage: 10
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .where('isRecipesGridPromoted.value', true)
      .sort('isRecipesGridPromoted.position');

    // Query for get chef official recipes for grid
    var queryChef = keystone.list('Recipe')
      .paginate({
        page: 1,
        perPage: 10
      })
      .where('state', 1)
      .where('isOfficial', true)
      .where('isRemoved', false)
      .where('isRecipesGridPromoted.value', false)
      .sort('-publishedDate');

    // Query for get order of grid
    var queryGridOrder = keystone.list('Config').model.find({
      name: {
        $in: [
          'grid_order_desktop_recipes',
          'grid_order_tablet_recipes',
          'grid_order_mobile_recipes',
          'grid_size_desktop_recipes',
          'grid_size_tablet_recipes',
          'grid_size_mobile_recipes'
        ]
      }
    });

    async.series([
        // Function for get recipes
        function(callback) {
          queryRecipes.exec(function(err, results) {

            locals.data.recipes = results.results;
            callback(err);
          });
        },
        // Function for get header recipe
        function(callback) {
          queryHeader.exec(function(err, results) {

            locals.data.header = results.results[0];
            callback(err);
          });
        },
        // Function for get recipes grid
        function(callback) {
          queryGrid.exec(function(err, resultsG) {

            var resultsGrid = resultsG.results;

            queryChef.exec(function(err, resultsC) {

              var resultsChef = resultsC.results;

              // Initialize empty array
              var grid = new Array(10);

              var isCompleteChefRecipes = false;

              // Check if official chef has 10 recipes, then empty grid array will be these 10 recipes
              if (resultsChef.length === 10) {
                grid = resultsChef;
                isCompleteChefRecipes = true;
              }

              // Change official recipes for promoted recipes in configured position
              for (var i = 0, l = resultsGrid.length; i < l; i++) {
                grid[resultsGrid[i].isRecipesGridPromoted.position] = resultsGrid[i];
              }

              // If chef recipes is not complete (not has 10 official recipes), will try fill empty positions with official recipes (maybe incompleted)
              // Note that If condition is true (promoted recipes + official recipes < 10) , maybe there will be some empty position in grid
              if (!isCompleteChefRecipes && resultsChef.length > 0) {
                for (var j = 0, m = grid.length; j < m; j++) {
                  if (!grid[j]) {
                    var el = resultsChef.shift();
                    grid[j] = el;
                  }
                }
              }

              locals.data.grid = grid;
              callback(err);
            });
          });
        },
        // Gets grid orders and sizes
        function(callback) {
          queryGridOrder.exec(function(err, results) {
            locals.data.order = {};
            locals.data.sizes = {};
            if (!err && results) {
              for (var i = 0, l = results.length; i < l; i++) {
                if (results[i].name.indexOf('grid_order') >= 0) {
                  locals.data.order[results[i].name] = results[i].value;
                }
                else {
                  locals.data.sizes[results[i].name] = results[i].value;
                }
              }
            }
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
