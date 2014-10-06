var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /question/:question/:state
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  service.question.state({
      slug: req.params.question,
      limit: 1,
      all: true
    },
    req.params.state,
    function(err, question) {
      if (err || !question) {
        res.status(404);
        answer.error = true;
      }
      else {
        if (question.state === req.params.state) {
          answer.success = true;
          answer.state = question.state;
        }
        else {
          answer.success = false;
          answer.error = true;
          answer.errorMessage = 'Unanswered question cannot be published.';
        }
      }
      return res.apiResponse(answer);
    });
};
