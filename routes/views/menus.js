var keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'menus';
  locals.data = {
    menus: []
  };
  locals.title = res.__('Menus');

  // load menus
  view.on('init', function(next) {

    // Query for get order of grid
    async.series([
        // Function for get menus
        function(callback) {
          var opts = {
            page: req.query.page || 1,
            perPage: 5
          };
          service.menuList.get(opts, function(err, results) {
            locals.data.menus = results.results;
            callback(err);
          });
        },
        // Function for get header menu
        function(callback) {
          service.pageHeader.menu.get({}, function(err, result) {
            locals.data.header = result;
            callback(err);
          });
        },
        // Function for get menus grid
        function(callback) {
          service.grid.get({
            section: 'Menus'
          }, function(err, results) {
            locals.data.grid = results;
            callback(err);
          });
        },
        // Gets grid orders and sizes
        function(callback) {
          service.config.grid.menus.get({}, function(err, results) {
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
  view.render('menus');
};
