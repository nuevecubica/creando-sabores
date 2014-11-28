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

/**
 * Returns recipes similar to a given recipe
 * @param  {Object}   options  recipeId
 * @param  {Function} callback (err, results)
 */
var getRelatedQuestions = function(options, callback) {
  options = _.defaults(options || {}, {
    limit: 3
  });

  callback = callback || function() {};

  if (!options.questionId) {
    return callback('Invalid questionId');
  }

  service.elastic.search({
    index: 'questions',
    type: 'question',
    body: {
      size: options.limit,
      query: {
        "filtered": {
          "filter": {
            "terms": {
              "state": ["published"],
              "_cache": true
            }
          },
          "query": {
            "more_like_this": {
              "fields": ["title^3", "answer"],
              "ids": [options.questionId.toString()],
              "min_term_freq": 1,
              "max_query_terms": 12,
              "min_word_length": 3
            }
          }
        }
      }
    }
  }, function(err, results, status) {
    if (results && results.hits) {
      results = results.hits.hits || [];
    }
    else {
      results = [];
    }
    callback(err, results, status);
  });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllQuestions,
  related: getRelatedQuestions
};

exports = module.exports = _service;
