var keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'home';

  // load recipes
  view.on('init', function(next) {

    locals.data = {};
    async.series([

        function(callback) {
          service.pageHeader.home.get({}, function(err, result) {
            locals.data.header = result;
            callback(err);
          });
        },
        // Gets recipes grid
        function(callback) {
          service.recipeList.grid.get({
            section: 'Index'
          }, function(err, results) {
            locals.data.grid = results;
            callback(err);
          });
        },
        // Gets order grid
        function(callback) {
          service.config.grid.home.get({}, function(err, results) {

            locals.data.order = results.order;
            locals.data.sizes = results.sizes;

            callback(err);
          });
        },
        // Get last videorecipes
        function(callback) {
          service.recipeList.videorecipe.get({
            sort: '-publishedDate'
          }, function(err, results) {
            var last = results.results.shift();
            locals.data.videorecipes = {
              last: last,
              lastFormattedDate: moment(last.publishedDate).format('L'),
              lastest: results.results
            };
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
