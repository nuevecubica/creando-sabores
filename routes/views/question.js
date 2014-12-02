var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services'),
  moment = require('moment');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  locals.section = 'question';

  locals.filters = {
    question: req.params.question || null
  };

  var options = {
    slug: locals.filters.question,
    populate: ['author', 'chef']
  };

  var toTitleCase = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // load question
  view.on('init', function(next) {

    service.question.get(options, function(err, result) {
      if (!err && result) {
        locals.data.question = result;
        locals.data.formattedDate = moment(result.createdDate).format('lll');
        locals.title = toTitleCase(result.title.substr(0, 10)) + '...';
        service.questionList.related({
          questionId: result._id
        }, function(err, results, status) {
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
  view.render('question');
};
