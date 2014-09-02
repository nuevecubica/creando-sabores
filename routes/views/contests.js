var keystone = require('keystone'),
  async = require('async');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'contests';
  locals.data = {
    contests: [],
    current: null
  };
  locals.title = res.__('Contests');

  // load contests
  view.on('init', function(next) {

    // Query for get contests for list
    keystone.list('Contest')
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('state', 1)
      .sort('-endDate').exec(function(err, results) {

        locals.data.current = results.results;
        // Query for get current contest
        keystone.list('Contest')
          .paginate({
            page: 1,
            perPage: 1
          })
          .where('state', 1)
          .sort('-endDate')
          .exec(function(err, results) {
            locals.data.contests = results.results;
          });
      });
  });
  // Render the view
  view.render('contests');
};
