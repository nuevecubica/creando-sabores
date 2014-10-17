var keystone = require('keystone'),
  async = require('async'),
  moment = require('moment'),
  service = require(__base + 'services'),
  Contest = keystone.list('Contest');

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

    var queryCurrentContest = Contest.model.findOne({
      'state': {
        '$in': ['programmed', 'submission', 'votes']
      }
    });

    var getCurrentContest = function(callback) {
      // Query for get current contest
      queryCurrentContest.exec(function(err, contest) {
        if (!err && contest) {
          if ((contest.state === 'programmed' &&
              moment().isAfter(contest.programmedDate)) ||
            (contest.state === 'submission' &&
              moment().isAfter(contest.submissionDeadline)) ||
            (contest.state === 'votes' &&
              moment().isAfter(contest.deadline))) {
            contest.save();
            return getCurrentContest(callback);
          }
          locals.data.current = contest;
          locals.data.current.formattedDeadline = moment(contest.deadline).format('L');
        }
        callback(err, contest || {});
      });
    };

    async.series([

        getCurrentContest,

        function(callback) {
          service.contestList.getWithWinners({
            page: req.query.page || 1,
            perPage: req.query.perPage || 5
          }, function(err, contests) {
            if (!err && contests) {
              locals.data.contests = contests.results;
              callback(err);
            }
            else {
              console.error('Error: Query last contests', err);
              return res.notfound(res.__('Not found'));
            }
          });
        }
      ],
      function(err, results) {
        if (err) {
          console.error('Error: Query contests', err);
          return res.notfound(res.__('Not found'));
        }
        next(err);
      });
  });

  // Render the view
  view.render('contests');
};
