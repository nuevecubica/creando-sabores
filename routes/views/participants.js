var keystone = require('keystone'),
  async = require('async'),
  moment = require('moment'),
  Contest = keystone.list('Contest');

exports = module.exports = function(req, res) {

  moment.locale('es');

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Participants');
  locals.section = 'participants';
  locals.subsection = req.params.section;

  locals.data = {};

  locals.filters = {
    contestId: null,
    contestSlug: req.params.contest,
    section: req.params.section
  };

  var getRecipes = function(contestId, order, callback) {
    var queryRecipes = keystone.list('Recipe')
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('contest.id', contestId)
      .where('contest.state', 'admited')
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      // change rating, fake in contest
      .sort(order)
      .exec(function(err, recipes) {
        if (!err && recipes) {
          locals.data.recipes = recipes.results;
          callback();
        }
        else {
          callback(err);
        }
      });
  };

  async.waterfall([

    function(callback) {
      var queryContest = Contest.model.findOne({
        'slug': locals.filters.contestSlug
      });
      queryContest.exec(function(err, contest) {
        if (!err && contest) {

          // contest.deadline = moment(contest.deadline).format('LLLL');

          locals.data.contest = contest;
          locals.filters.contestId = contest._id;

        }
        callback(err, contest);
      });
    },
    function(contest, callback) {
      if (locals.subsection === 'top') {
        getRecipes(contest._id, '-rating', callback);
      }
      else if (locals.subsection === 'reciente') {
        getRecipes(contest._id, '-publishedDate', callback);
      }
    },
  ], function(err) {
    // Render the view
    view.render('participants');
  });

};
