var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

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
      }, function(err, tips) {
        if (!err && tips) {
          tips.results = tips.results.map(function(item, i) {
            return hideMyApi(item, safe.tip.populated);
          });
          answer.tips = tips;
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
