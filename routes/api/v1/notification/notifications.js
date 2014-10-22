var async = require('async'),
  service = require(__base + 'services'),
  keystone = require('keystone');

/*
  /user/email/subscribe
  /user/email/unsubscribe
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  var options = {
    email: req.params.email,
    token: req.params.token
  };

  var notification = req.params.notification;

  var callback = function(err, result) {
    if (err || !result) {
      res.status(404);
      answer.success = false;
      answer.error = true;
      answer.errorMessage = (err || 'Invalid params');
    }
    else {
      answer.success = true;
    }

    return res.apiResponse(answer);
  };

  if (service.notifications[req.params.action][notification]) {
    service.notifications[req.params.action][notification](options, callback);
  }
  else {
    callback(true, null);
  }
};
