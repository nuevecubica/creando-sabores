var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /question?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  service.questionList.get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    populate: ['author']
  }, function(err, questions) {
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
