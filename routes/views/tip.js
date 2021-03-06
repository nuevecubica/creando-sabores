var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'tip';

  locals.filters = {
    tip: req.params.tip || null
  };

  var options = {
    slug: locals.filters.tip,
    populate: ['author']
  };

  var toTitleCase = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // load tip
  view.on('init', function(next) {

    service.tip.get(options, function(err, result) {
      if (!err && result) {
        locals.data.tip = result;
        locals.data.formattedDate = moment(result.publishedDate).format('lll');
        locals.title = toTitleCase(result.title.substr(0, 10)) + '...';
        service.tipList.related({
          tipId: result._id
        }, function(err, results) {
          locals.related = results;
          next(err);
        });
      }
      else {
        return res.notfound(res.__('Not found'));
      }
    });
  });

  // Render the view
  view.render('tip');
};
