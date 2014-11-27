var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Banner = keystone.list('Banner'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getAllBanners = function(options, callback) {
  var data = {};

  options = _.defaults(options || {}, {
    user: null,
    authorId: null,
    slug: null,
    populate: [],
    sort: '-publishedDate',
    flags: ['+published'],
    page: 1,
    perPage: 10,
    limit: null,
    states: null
  });

  var query = queryMaker(Banner, options);

  query.exec(callback || function() { /* dummy */ });
};

var getOneBanner = function(options, callback) {
  options = _.defaults(options || {}, {
    one: true
  });

  getAllBanners(options, callback);
};


/*
  Set exportable object
 */
var _service = {
  get: getAllBanners,
};
_service.get.one = getOneBanner;


exports = module.exports = _service;
