var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Question = keystone.list('Question'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getAllQuestions = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    user: null,
    authorId: null,
    all: false,
    sort: '-publishedDate',
    states: ['published', 'closed']
  });

  if (options.all) {
    options.states.push('review');
    options.states.push('removed');
  }

  var query = queryMaker(Question, options);

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllQuestions,
};

exports = module.exports = _service;
