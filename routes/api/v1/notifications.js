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
    email: req.params.email
  };

  var notification = req.params.notification;

  var callback = function(err, result) {
    if (err || !result) {
      answer.success = false;
      answer.error = true;
      answer.errorMessage = err;
    }
    else {
      answer.success = true;
    }

    return res.apiResponse(answer);
  };

  if (service.notifications[notification]) {
    service.notifications[req.params.action][notification](options, callback);
  }
  else {
    callback(true, null);
  }
};
