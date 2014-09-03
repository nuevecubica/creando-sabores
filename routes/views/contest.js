var keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest'),
  Recipes = keystone.list('Recipes');

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
    }).populate('awards.jury.winner', 'awards.community.winner');

    async.waterfall([
      function(callback) {
        queryContest.exec(function(err, result) {
          if (!err && result) {
            console.log(result);

            locals.data.contest = result;
            callback(null, result.id);
          }
          else {
            if (err) {
              callback(err, null);
            }
            else {
              callback(null, null);
            }
          }
        });
      },
      function(contestId, callback) {
        if (contestId) {
          var queryTop = Recipes.model.find({
            'contest.id': contestId
          }).populate('contest.id');

          queryTop.exec(function(err, result) {
            if (!err && result) {
              locals.data.top = result;
            }
            else {
              if (err) {
                callback(err)
              }
              else {
                callback();
              }
            }
          });
        }
        else {
          callback();
        }
      }
    ], function(err, result) {
      if(!err) {
        next();
      }
      else {
        next(err);
      }
    });

  });

  // Render the view
  view.render('contest');
};
