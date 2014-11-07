var keystone = require('keystone'),
  async = require('async'),
  moment = require('moment'),
  service = require(__base + 'services');

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

    async.series([

        function(callback) {
          service.contestList.get({
            state: ['programmed', 'submission', 'votes'],
            one: true
          }, function(err, contest) {
            if (!err && contest) {
              locals.data.current = contest;
              locals.data.current.formattedDeadline = moment(contest.deadline).format('L');
            }
            callback(err);
          });
        },

        function(callback) {
          service.contestList.getWithWinners({
            page: req.query.page || 1,
            perPage: req.query.perPage || 5,
            states: ['finished']
          }, function(err, contests) {
            if (!err && contests) {
              locals.data.contests = contests.results;
              callback(err);
            }
            else {
              logger.error('Error: Query last contests', err);
              return res.notfound(res.__('Not found'));
            }
          });
        }
      ],
      function(err, results) {
        if (err) {
          logger.error('Error: Query contests', err);
          return res.notfound(res.__('Not found'));
        }
        next(err);
      });
  });

  // Render the view
  view.render('contests');
};
