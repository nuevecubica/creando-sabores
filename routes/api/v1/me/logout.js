var async = require('async'),
  keystone = require('keystone');

exports = module.exports = function(req, res) {
  var Users = keystone.list('User'),
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {
      var onSuccess = function() {
        // Logged out
        answer.success = true;
        return next(false);
      };
      keystone.session.signout(req, res, onSuccess);
    }
  ], function(err) {
    return res.apiResponse(answer);
  });

};
