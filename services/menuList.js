var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Menu = keystone.list('Menu'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

/**
 * Returns an array of menus
 * @param  {Object}   options
 * @param  {Function} callback
 */
var getMenus = function(options, callback) {

  options = _.defaults(options || {}, {
    sort: '-publishedDate',
    states: ['published']
  });

  if (options.all) {
    options.states.push('draft');
    options.states.push('banned');
  }

  var query = queryMaker(Menu, options);
  var next = callback || function() { /* dummy */ };

  query.exec(next);
};

/**
 * Returns an array of related menus
 * @param  {Object}   options
 * @param  {Function} callback
 */
var getRelatedMenus = function(options, callback) {
  options = _.defaults(options || {}, {
    limit: 3
  });

  callback = callback || function() {};

  if (!options.menuId) {
    return callback('Invalid menuId');
  }

  service.elastic.search({
    index: 'menus',
    type: 'menu',
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
              "fields": ["title", "description"],
              "ids": [options.menuId.toString()],
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

/**
 * Returns menus populated with recipes
 * @param  {Object}   options
 * @param  {Function} callback
 */
var getMenusWithRecipes = function(options, callback) {
  options = _.defaults(options || {}, {
    populate: ['plates']
  });
  return getMenus(options, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getMenus,
  related: getRelatedMenus
};

_service.get.withRecipes = getMenusWithRecipes;

exports = module.exports = _service;
