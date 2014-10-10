var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'questions';
  locals.subsection = req.params.section || 'recientes';


  // load questions
  view.on('init', function(next) {

    var options = {
      page: req.query.page || 1,
      perPage: 5,
      populate: ['author']
    };

    // If user is admin, get all questions
    if (req.user && req.user.canAdmin) {
      options.states = ['review', 'published', 'closed'];
    }

    service.questionList.get(options, function(err, results) {
      locals.data.questions = results.results;
      locals.data.questions.map(function(a, i) {
        a.formattedDate = moment(a.createdDate).format('lll');
      });
      next(err);
    });
  });

  // Render the view
  view.render('questions');
};
