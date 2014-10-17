var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  _ = require('underscore'),
  Contest = keystone.list('Contest');

/*
  /contests/past?page=1&perPage=5
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  async.series([

      function(callback) {
        service.contestList.getWithWinners({
          page: req.query.page || 1,
          perPage: req.query.perPage || 5,
          states: ['finished']
        }, function(err, contests) {
          if (err) {
            answer.error = true;
            return res.notfound(res.__('Not found'));
          }
          else {
            answer.contests = contests;
            answer.success = true;
          }
          callback(err);
        });
      }
    ],
    function(err, results) {
      return res.apiResponse(answer);
    });
};
