var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services');

/*
  /me/tips/
*/


// var getMyTips = function(req, res) {
// };

var getMyFavouriteTips = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  async.series([

    function(next) {
      service.user.tips.get.favourites({
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

var tips = {
  get: {
    // my: getMyTips
    favourites: getMyFavouriteTips
  }
};

exports = module.exports = tips;
