var keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  Recipe = keystone.list('Recipe');

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

    service.contestList.getWithWinners({
      slug: locals.filters.contest,
      one: true,
    }, function(err, result) {
      if (!err && result) {

        if ((!req.user || !req.user.isAdmin) && ['draft'].indexOf(result.state) >= 0) {
          return res.notfound(res.__('Not found'));
        }

        locals.data.contest = result;
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
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  });

  // Render the view
  view.render('contest');
};
