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


/**
 * Returns tips similar to a given tip
 * @param  {Object}   options  tipId
 * @param  {Function} callback (err, results)
 */
var getRelatedTips = function(options, callback) {
  options = _.defaults(options || {}, {
    limit: 5
  });

  callback = callback || function() {};

  if (!options.tipId) {
    return callback('Invalid tipId');
  }

  service.elastic.search({
    index: 'tips',
    type: 'tip',
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
              "fields": ["title", "tip"],
              "ids": [options.tipId.toString()],
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
  get: getAllTips,
  related: getRelatedTips
};

exports = module.exports = _service;
