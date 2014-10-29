var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment'),
  modelCleaner = require(__base + 'utils/modelCleaner');

/*
  /api/v1/notifications/get/newsletter/users
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {};

  if (req.params.notification === 'newsletter') {
    options.flags = ['+receiveNewsletter'];
  }

  service.userList.get(options, function(err, users) {
    if (!err && users) {
      answer.success = true;

      var usersList = [];
      _.each(users.results, function(user) {
        var u = {
          email: user.email,
          unsubscribe: user.getNewsletterUnsubscribeUrl(),
          token: user.getNewsletterToken(),
          receiveNewsletter: user.receiveNewsletter
        };

        usersList.push(u);
      });

      answer.users = usersList;
    }
    else {
      res.status(401);
      answer.error = true;
      answer.errorMessage = err;
    }

    return res.apiResponse(answer);
  });
};
