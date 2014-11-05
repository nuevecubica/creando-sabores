var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /questions?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    populate: ['author', 'chef']
  };

  // If user is admin, get all questions
  if (req.user && req.user.isAdmin) {
    options.states = ['review', 'published', 'closed'];
  }

  service.questionList.get(options, function(err, questions) {
    if (err || !questions) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      questions.results.forEach(function(item, i) {
        item = hideMyApi(item, safe.question.populated);
        item.formattedDate = moment(item.createdDate).format('lll');
        questions.results[i] = item;
      });
      answer.questions = questions;
    }
    return res.apiResponse(answer);
  });
};
