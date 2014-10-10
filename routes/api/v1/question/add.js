var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment');

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
        var q = question.toJSON();
        q.author = req.user;
        q.formattedDate = moment(q.createdDate).format('lll');
        answer.question = q;
      }
      return res.apiResponse(answer);
    });
};
