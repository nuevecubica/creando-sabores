var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Question = keystone.list('Question'),
  service = require('./index');

var getAllQuestions = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    user: null,
    authorId: null,
    slug: null, // to query one question
    populate: [],
    all: false,
    sort: '-publishedDate',
    flags: [],
    page: 1,
    perPage: 10,
    limit: null,
    states: ['published', 'closed']
  });

  var query = {};

  if (options.limit) {
    options.perPage = options.limit;
  }

  if (options.limit === 1) {
    query = Question.model.findOne();
  }
  else if (!options.page) {
    query = Question.model.find();
    if (options.limit || options.perPage) {
      query.limit(options.limit || options.perPage);
    }
  }
  else {
    query = Question.paginate({
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
    states.push('review');
    states.push('removed');
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
  get: getAllQuestions,
};

exports = module.exports = _service;
