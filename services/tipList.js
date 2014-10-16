var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Tip = keystone.list('Tip'),
  service = require('./index');

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

  var query = {};

  if (options.limit) {
    options.perPage = options.limit;
  }

  if (options.limit === 1) {
    query = Tip.model.findOne();
  }
  else if (!options.page) {
    query = Tip.model.find();
    if (options.limit || options.perPage) {
      query.limit(options.limit || options.perPage);
    }
  }
  else {
    query = Tip.paginate({
      page: options.page,
      perPage: options.perPage
    });
  }

  if (options.slug) {
    query.where('slug', options.slug);
  }

  if (options.authorId) {
    query.where('author', options.authorId);
  }

  var states = options.states || [];

  if (options.all) {
    states.push('draft');
  }

  if (states.length) {
    states = _.unique(states);
    query.in('state', states);
  }

  if (options.flags && options.flags.length > 0) {
    _.each(options.flags, function(flag) {
      if (flag[0] === '-') {
        query.where(flag.substr(1), false);
      }
      else if (flag[0] === '+') {
        query.where(flag.substr(1), true);
      }
      else {
        query.where(flag, true);
      }
    });
  }

  if (options.sort) {
    query.sort(options.sort);
  }

  if (options.populate && options.populate.length) {
    options.populate.forEach(function(pop) {
      query.populate(pop);
    });
  }

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllTips,
};

exports = module.exports = _service;
