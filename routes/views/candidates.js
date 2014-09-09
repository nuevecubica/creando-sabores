var keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Candidates');
  locals.section = 'candidates';
  locals.subsection = req.params.section;

  locals.data = {};

  locals.filters = {
    contestId: null,
    contestSlug: req.params.contest,
    section: req.params.section
  };

  view.on('init', function(next) {

    var queryContest = Contest.model.findOne({
      'slug': locals.filters.contestSlug
    });

    var queryTopRecipes = keystone.list('Recipe')
      .paginate({
        page: req.query.page || 1,
        perPage: 10
      })
      .where('contest.id', locals.filters.contestId)
      .where('contest.status', 'admited')
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      // change rating, fake in contest
      .sort('-rating');


    var queryRecentRecipes = keystone.list('Recipe')
      .paginate({
        page: req.query.page || 1,
        perPage: 10
      })
      .where('contest.id', locals.filters.contestId)
      .where('contest.status', 'admited')
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .sort('-publishedDate');

    async.series([

      function(callback) {
        queryContest.exec(function(err, contest) {
          if (!err && contest) {
            locals.data.contest = contest;
            locals.filters.contestId = contest._id;

            callback();
          }
          else {
            console.log('CONTEST', err);
            callback(err);
          }
        });
      },
      function(callback) {
        queryTopRecipes.exec(function(err, recipes) {
          if (!err && recipes) {
            locals.data.top = recipes;

            callback();
          }
          else {
            callback(err);
          }
        });
      },
      function(callback) {
        queryRecentRecipes.exec(function(err, recipes) {
          if (!err && recipes) {
            locals.data.recent = recipes;

            console.log(recipes);

            callback();
          }
          else {
            callback(err);
          }
        });
      }
    ], function(err) {
      next(err);
    });
  });

  // Render the view
  view.render('candidates');
};
