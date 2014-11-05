var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  service = require(__base + 'services');

/*
	/me/menus?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };
  service.menuList.get({
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    user: req.user,
    authorId: req.user._id,
    sort: '-publishedDate',
    all: true,
  }, function(err, menus) {
    if (err || !menus) {
      res.status(404);
      answer.error = true;
    }
    else if (menus.total > 0) {
      answer.success = true;
      answer.menus = menus;
    }
    return res.apiResponse(answer);
  });
};
