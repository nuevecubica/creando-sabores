var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

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
    perPage: req.query.perPage || 10
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
      answer.questions = questions;
    }
    return res.apiResponse(answer);
  });
};
