var keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest'),
  Recipe = keystone.list('Recipe'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Contest');
  locals.section = 'contest';

  locals.data = {};

  locals.filters = {
    contest: req.params.contest
  };

  // load contests
  view.on('init', function(next) {

    // Query for get a contest
    var queryContest = Contest.model.findOne({
        slug: locals.filters.contest
      })
      .populate('awards.jury.winner awards.community.winner');

    queryContest.exec(function(err, result) {
      if (!err && result) {

        if ((result.state === 'programmed' &&
            moment().isAfter(result.programmedDate)) ||
          (result.state === 'submission' &&
            moment().isAfter(result.submissionDeadline)) ||
          (result.state === 'votes' &&
            moment().isAfter(result.deadline))) {
          result.save();
        }

        if ((!req.user || !req.user.isAdmin) && ['draft', 'programmed'].indexOf(result.state) >= 0) {
          return res.notfound(res.__('Not found'));
        }

        // Populate nested recipe author (jury winner)
        var optionsJuryAuthor = {
          path: 'awards.jury.winner.author awards.jury.community.author',
          model: 'User'
        };

        Contest.model.populate(result, optionsJuryAuthor, function(err, contestJuryPopulated) {
          if (err) {
            console.error('Error: Contest.model.populate jury winner');
            return res.notfound(res.__('Not found'));
          }

          // Populate nested recipe author (community winner)
          var optionsCommunityAuthor = {
            path: 'awards.community.winner.author',
            model: 'User'
          };

          Contest.model.populate(contestJuryPopulated, optionsCommunityAuthor, function(err, contestCommunityPopulated) {
            if (err) {
              console.error('Error: Contest.model.populate community winner');
              return res.notfound(res.__('Not found'));
            }

            locals.data.contest = contestCommunityPopulated;
            var queryTop = Recipe.model.find({
                'contest.id': result.id,
                'state': 'published'
              })
              .limit(4)
              .populate('contest.id')
              .sort('-likes')
              .exec(function(err, result) {
                if (!err && result) {
                  locals.data.top = result;
                  next();
                }
                else {
                  return res.notfound(res.__('Not found'));
                }
              });
          });
        });
      }
      else {
        console.error('Error: queryContest', queryContest);
        return res.notfound(res.__('Not found'));
      }
    });
  });

  // Render the view
  view.render('contest');
};
