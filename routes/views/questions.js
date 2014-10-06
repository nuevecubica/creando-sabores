var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  // load questions
  view.on('init', function(next) {

    var options = {
      page: req.query.page || 1,
      perPage: 5
    };

    // If user is admin, get all questions
    if (req.user && req.user.canAdmin) {
      options.all = true;
    }

    service.questionList.get(options, function(err, results) {
      locals.data.questions = results.results;
      next(err);
    });
  });

  // Render the view
  view.render('questions');
};
