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

    var queryGrid = keystone.list('Recipe').paginate({
        page: 1,
        perPage: 10
      })
      .where('state', 1)
      .where('isBanned', false)
      .where('isRecipesGridPromoted.value', true)
      .sort('isRecipesGridPromoted.position');

    var queryGridOrder = keystone.list('Config')
      .paginate()
      .or([{
        name: 'grid_order_desktop_recipes'
      }, {
        name: 'grid_order_tablet_recipes'
      }, {
        name: 'grid_order_mobile_recipes'
      }]);

    var queryGridSize = keystone.list('Config')
      .paginate()
      .or([{
        name: 'grid_size_desktop_recipes'
      }, {
        name: 'grid_size_tablet_recipes'
      }, {
        name: 'grid_size_mobile_recipes'
      }]);

    async.series([

        // Function for get recipes grid
        function(callback) {
          queryGrid.exec(function(err, results) {

            var grid = new Array(10);
            var result = results.results;

            for (var j = 0; j < result.length; j++) {
              grid[result[j].isRecipesGridPromoted.position] = result[j];
            }

            locals.data.grid = grid;
            callback(err);
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
