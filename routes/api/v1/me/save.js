var async = require('async'),
  keystone = require('keystone');

exports = module.exports = function(req, res) {
  var Users = keystone.list('User'),
    query = {
      _name: req.body.name || null
    },
    answer = {
      success: false,
      error: false
    };

  async.series([

    function(next) {
      if (query._name) {

        var onSuccess = function() {
          // Logged in
          answer.success = true;
          return next(false);
        };
        var onFail = function(e) {
          // Failed
          res.status(401);
          return next(true);
        };

        next();
      }
      else {
        // Missing data
        answer.error = true;
        res.status(401);
        return next(true);
      }
    }
  ], function(err) {
    if (err) {
      return res.apiResponse(answer);
    }
    else {
      return res.apiResponse(answer);
    }
  });
};
