var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  moment = require('moment'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /tips?page=1&perPage=10
*/

var getRecentTips = function(req, res) {
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
      tips.results = tips.results.map(function(item, i) {
        item = hideMyApi(item, safe.tip.populated);
        item.formattedDate = moment(item.createdDate).format('lll');
        return item;
      });
      answer.tips = tips;
    }
    return res.apiResponse(answer);
  });
};

var getPopularTips = function(req, res) {
  var answer = {
    success: false,
    error: false
  };

  var options = {
    page: req.query.page || 1,
    perPage: req.query.perPage || 10,
    sort: '-rating',
    populate: ['author']
  };

  service.tipList.get(options, function(err, tips) {
    if (err || !tips) {
      res.status(404);
      answer.error = true;
    }
    else {
      answer.success = true;
      tips.results = tips.results.map(function(item, i) {
        item = hideMyApi(item, safe.tip.populated);
        item.formattedDate = moment(item.createdDate).format('lll');
        return item;
      });
      answer.tips = tips;
    }
    return res.apiResponse(answer);
  });
};

var tips = {
  recent: getRecentTips,
  popular: getPopularTips
};

exports = module.exports = tips;
