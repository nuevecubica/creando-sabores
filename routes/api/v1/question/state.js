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

  var ref = req.headers.referer;
  if (!ref || ref.split('/')[2] !== req.headers.host) {
    res.status(403);
    answer.error = true;
    answer.errorMessage = 'Missing or wrong referer.';
    return res.apiResponse(answer);
  }

  service.question.state({
      slug: req.params.question,
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
