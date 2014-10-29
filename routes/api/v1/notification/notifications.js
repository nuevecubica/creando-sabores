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

  var notification = req.params.notification,
    action = req.params.action;

  var callback = function(err, result) {
    if (err || !result) {
      res.status(401);
      answer.success = false;
      answer.error = true;
      answer.errorMessage = (err || 'Invalid params');
    }
    else {
      answer.success = true;
    }

    return res.apiResponse(answer);
  };

  if (service.notifications[action][notification]) {
    service.notifications[action][notification](options, callback);
  }
  else {
    callback('Unknown action', null);
  }
};
