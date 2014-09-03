var keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest');

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
    var q = Contest.model.findOne({
      slug: locals.filters.contest
    }).populate('awards.jury.winner', 'awards.community.winner');

    q.exec(function(err, result) {
      if (!err && result) {
        console.log(result);

        locals.data.contest = result;
        next();
      }
      else {
        if (err) {
          next(err);
        }
        else {
          next(null);
        }
      }
    });
  });

  // Render the view
  view.render('contest');
};
