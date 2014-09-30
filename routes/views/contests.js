var keystone = require('keystone'),
  async = require('async'),
  moment = require('moment'),
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

    var queryLastContest = Contest
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .populate('awards.jury.winner awards.community.winner')
      .where('state', 'finished')
      .sort('-deadline');

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
          queryLastContest.exec(function(err, contests) {

            if (!err && contests) {

              var optionsJuryAuthor = {
                path: 'awards.jury.winner.author',
                model: 'User'
              };

              var optionsCommunityAuthor = {
                path: 'awards.community.winner.author',
                model: 'User'
              };

              async.each(contests.results, function(contest, done) {

                  // Populate nested recipe author (jury winner)
                  Contest.model.populate(contest, optionsJuryAuthor, function(err, contestJuryPopulated) {

                    if (!err) {
                      // Populate nested recipe author (community winner)
                      Contest.model.populate(contestJuryPopulated, optionsCommunityAuthor, function(err, contestCommunityPopulated) {

                        if (!err) {
                          locals.data.contests.push(contestCommunityPopulated);

                          done();
                        }
                        else {
                          console.error('Error: Contest.model.populate community winner', err);
                          return res.notfound(res.__('Not found'));
                        }
                      });
                    }
                    else {
                      console.error('Error: Contest.model.populate jury winner', err);
                      return res.notfound(res.__('Not found'));
                    }
                  });
                },
                function(err) {
                  if (err) {
                    console.error('Error: Async each contest', err);
                    return res.notfound(res.__('Not found'));
                  }
                  callback(err);
                });
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