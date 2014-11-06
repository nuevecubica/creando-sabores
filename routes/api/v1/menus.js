var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
	/menus?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  service.menuList.get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    //sort: req.query.order === 'recent' ? '-publishedDate' : '-rating'
  }, function(err, menus) {
    if (err || !menus) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      menus.results = menus.results.map(function(item, i) {
        return hideMyApi(item, safe.menu);
      });

      answer.menus = menus;
    }
    return res.apiResponse(answer);
  });
};
