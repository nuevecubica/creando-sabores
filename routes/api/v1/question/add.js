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

  service.question.add(req,
    function(err, question) {
      if (err || !question) {
        res.status(404);
        answer.error = true;
      }
      else {
        answer.success = true;
      }
      return res.apiResponse(answer);
    });
};
