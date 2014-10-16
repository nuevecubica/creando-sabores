var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Tip = keystone.list('Tip'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getAllTips = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    user: null,
    authorId: null,
    slug: null, // to query one tip
    populate: [],
    all: false,
    sort: '-publishedDate',
    flags: [],
    page: 1,
    perPage: 10,
    limit: null,
    states: ['published']
  });

  if (options.all) {
    options.states.push('draft');
  }

  var query = queryMaker(Tip, options);

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllTips,
};

exports = module.exports = _service;
