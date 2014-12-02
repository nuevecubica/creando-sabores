var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'tips';
  locals.subsection = req.params.section || 'recientes';
  locals.title = res.__('Tips');


  // load tips
  view.on('init', function(next) {

    var options = {
      page: req.query.page || 1,
      perPage: 5,
      populate: ['author']
    };

    // Query for get order of grid
    async.series([
        // Function for get recent recipes
        function(callback) {
          if (locals.subsection === 'populares') {
            options.sort = '-rating';
            locals.title += ' ' + res.__('Popular');
          }
          else {
            locals.title += ' ' + res.__('Recent');
          }

          service.tipList.get(options, function(err, results) {
            locals.data.tips = results.results;
            locals.data.tips.map(function(a, i) {
              a.formattedDate = moment(a.createdDate).format('lll');
            });
            callback(err);
          });
        },
        // Function for get header recipe
        function(callback) {
          service.pageHeader.tip.get({
            populate: ['author']
          }, function(err, result) {
            locals.data.header = result;
            callback(err);
          });
        }
      ],
      function(err) {
        next(err);
      });
  });

  // Render the view
  view.render('tips');
};
