var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'tips';
  locals.subsection = req.params.section || 'recientes';


  // load tips
  view.on('init', function(next) {

    var options = {
      page: req.query.page || 1,
      perPage: 5,
      populate: ['author']
    };

    service.tipList.get(options, function(err, results) {
      locals.data.tips = results.results;
      locals.data.tips.map(function(a, i) {
        a.formattedDate = moment(a.createdDate).format('lll');
      });
      next(err);
    });
  });

  // Render the view
  view.render('tips');
};
