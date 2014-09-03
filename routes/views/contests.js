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

  var contests = keystone.list('Contest');

  // load contests
  view.on('init', function(next) {

    async.parallel(
      [

        function(cb) {
          // Query for get contests for list
          contests
            .paginate({
              page: req.query.page || 1,
              perPage: 5
            })
            .where('state', 'open')
            .sort('-deadline').exec(function(err, results) {

              locals.data.current = results.results;
              cb(err, results.results);
            });
        },
        function(cb) {
          // Query for get current contest
          contests.model
            .find()
            .where({
              state: {
                $in: ['closed', 'finished']
              }
            })
            .sort('-deadline')
            .exec(function(err, results) {
              locals.data.contests = results.results;
              cb(err, results.results);
            });
        }
      ],
      function(err, results) {
        if (err) {
          console.error("Contests controller", err);
        }
        next(err);
      });
  });

  // Render the view
  view.render('contests');
};
