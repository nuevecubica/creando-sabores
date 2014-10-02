var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
	/me/shopping/list
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  async.series([

    function(next) {
      service.user.shopping.get({
        page: parseInt(req.query.page) || 1,
        perPage: parseInt(req.query.perPage) || 5,
        user: req.user
      }, function(err, result) {
        if (!err && result) {
          answer.recipes = result;
          answer.success = true;
          next(null);
        }
        else {
          answer.error = true;
          next(err);
        }
      });
    }
  ], function(err) {
    return res.apiResponse(answer);
  });


};
