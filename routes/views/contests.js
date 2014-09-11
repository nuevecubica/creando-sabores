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

    async.series([

        function(callback) {
          // Query for get current contest
          queryCurrentContest.exec(function(err, contest) {
            locals.data.current = contest;
            locals.data.current.formattedDeadline = moment(contest.deadline).format('L');

            callback(err, contest);
          });
        },

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
                          console.log('ERR', err);
                          done(err);
                        }
                      });
                    }
                    else {
                      console.log('ERR', err);
                      done(err);
                    }
                  });
                },
                function(err) {
                  console.log(locals.data.contests);
                  callback(err, contests);
                });
            }
            else {
              console.log('ERR');
              callback(err);
            }
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
