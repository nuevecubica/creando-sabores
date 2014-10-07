var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /question/add
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

  service.question.add(req,
    function(err, question) {
      if (err || !question) {
        res.status(404);
        answer.error = true;
      }
      else {
        answer.success = true;
        answer.question = question;
      }
      return res.apiResponse(answer);
    });
};
