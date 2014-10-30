var _ = require('underscore'),
  email = require(__base + 'services/email');

module.exports = exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };
  if (req.query.render) {
    email.render(req.body.id, req.body.data, function(err, result, options) {
      if (err) {
        answer.error = true;
        answer.errorMessage = err;
        res.status(401);
      }
      else {
        answer.success = true;
        answer.input = _.omit(options, ['user', '_', 'moment', 'utils', 'mandrill']);
        answer.output = result;
      }
      return res.apiResponse(answer);
    });
  }
  else {
    email.send(req.body.id, req.body.data, function(err, result, options) {
      if (err) {
        answer.error = true;
        answer.errorMessage = err;
        res.status(401);
      }
      else {
        answer.success = true;
        answer.input = _.omit(options, ['user', '_', 'moment', 'utils', 'mandrill']);
        answer.output = result;
      }
      return res.apiResponse(answer);
    });
  }
};
