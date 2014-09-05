var keystone = require('keystone'),
  async = require('async');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'home';

  // load recipes
  view.on('init', function(next) {

    locals.data = {};

    // Query for get recipes for grid
    var queryGrid = keystone.list('Recipe').paginate({
        page: 1,
        perPage: 10
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isIndexGridPromoted.value', true)
      .sort('isIndexGridPromoted.position');

    // Query for get header promoted recipe
    var queryHeader = keystone.list('Recipe')
      .paginate({
        page: 1,
        perPage: 1
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isIndexHeaderPromoted', true)
      .sort('-publishedDate');

    // Query for get order of grid
    var queryGridOrder = keystone.list('Config')
      .paginate()
      .or([{
        name: 'grid_order_desktop_home'
      }, {
        name: 'grid_order_tablet_home'
      }, {
        name: 'grid_order_mobile_home'
      }]);

    // Query for get chef official recipes for grid
    var queryChef = keystone.list('Recipe').paginate({
        page: 1,
        perPage: 10
      })
      .where('state', 1)
      .where('isOfficial', true)
      .where('isIndexGridPromoted.value', false)
      .sort('-publishedDate');

    // Query for get size of grid
    var queryGridSize = keystone.list('Config')
      .paginate()
      .or([{
        name: 'grid_size_desktop_home'
      }, {
        name: 'grid_size_tablet_home'
      }, {
        name: 'grid_size_mobile_home'
      }]);

    async.series([

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
                grid[resultsGrid[i].isIndexGridPromoted.position] = resultsGrid[i];
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
        // Function for get order grid
        function(callback) {
          queryGridOrder.exec(function(err, results) {

            var result = results.results;

            locals.data.order = {};
            for (var i = 0; i < result.length; i++) {
              locals.data.order[result[i].name] = result[i].value;
            }

            callback(err);
          });
        },
        // Function for get sizes grid
        function(callback) {
          queryGridSize.exec(function(err, results) {

            var result = results.results;

            locals.data.sizes = {};
            for (var i = 0; i < result.length; i++) {
              locals.data.sizes[result[i].name] = result[i].value;
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
  view.render('index');

};
