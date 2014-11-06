var async = require('async'),
  keystone = require('keystone'),
  _ = require('underscore'),
  User = keystone.list('User'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /chef/menus?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var q = User.model.findOne({
    username: req.params.username
  });
  q.exec(function(err, result) {
    if (err || !result) {
      res.status(404);
      answer.error = true;
      return res.apiResponse(answer);
    }
    else {
      service.menuList.get({
        page: req.query.page || 1,
        perPage: req.query.perPage || 10,
        user: req.user,
        authorId: result._id,
        sort: '-publishedDate',
      }, function(err, menus) {
        if (err || !menus) {
          res.status(404);
          answer.error = true;
        }
        else if (menus.total > 0) {
          answer.success = true;
          menus.results = menus.results.map(function(item, i) {
            return hideMyApi(item, safe.menu);
          });

          answer.menus = menus;
        }
        return res.apiResponse(answer);
      });
    }
  });
};
