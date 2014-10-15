var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment'),
  modelCleaner = require(__base + 'utils/modelCleaner');

/*
  /tips?page=1&perPage=10
*/

exports = module.exports = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    populate: ['author']
  };

  service.tipList.get(options, function(err, tips) {
    if (err || !tips) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      tips.results.map(function(a, i) {
        a = a.toObject({
          virtuals: true,
          transform: modelCleaner.transformer
        });
        a.formattedDate = moment(a.createdDate).format('lll');
        tips.results[i] = a;
      });
      answer.tips = tips;
    }
    return res.apiResponse(answer);
  });
};
