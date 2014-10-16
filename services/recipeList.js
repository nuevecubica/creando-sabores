var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

/**
 * Reads both recipes and videorecipes from the database
 *
 * @param  {Object}   options { all: false, sort: '-rating', fromContests: false }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getAllRecipes = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    all: false,
    sort: '-rating',
    fromContests: false,
    states: ['published']
  });

  if (options.all) {
    options.states.push('draft');
    options.states.push('review');
    options.states.push('banned');
  }

  if (options.states.length) {
    // Just in case it requests review recipes, forces fromContest
    if (options.states.indexOf('review') !== -1) {
      options.fromContests = true;
    }
  }

  var query = queryMaker(Recipe, options);

  if (!options.fromContests) {
    query.where('contest.id', null);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Reads only videorecipes from the database. Uses getAllRecipes internally.
 * @param  {Object}   options  getAllRecipes options.
 * @param  {Function} callback
 */
var getVideoRecipes = function(options, callback) {
  if (!options.flags) {
    options.flags = ['+isVideorecipe'];
  }
  else if (options.flags.indexOf('+isVideorecipe') === -1) {
    options.flags.push('+isVideorecipe');
  }
  getAllRecipes(options, callback);
};

/**
 * Reads only recipes from the database. Uses getAllRecipes internally.
 * @param  {Object}   options  getAllRecipes options.
 * @param  {Function} callback
 */
var getRecipes = function(options, callback) {
  if (!options.flags) {
    options.flags = ['-isVideorecipe'];
  }
  else if (options.flags.indexOf('-isVideorecipe') === -1) {
    options.flags.push('-isVideorecipe');
  }
  getAllRecipes(options, callback);
};

/**
 * Returns recipes similar to a given recipe
 * @param  {Object}   options  recipeId
 * @param  {Function} callback (err, results)
 */
var getRelatedRecipes = function(options, callback) {
  options = _.defaults(options || {}, {
    limit: 3
  });

  callback = callback || function() {};

  if (!options.recipeId) {
    return callback('Invalid recipeId');
  }

  service.elastic.search({
    index: 'recipes',
    type: 'recipe',
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
              "fields": ["title^5", "description^4", "ingredients^2", "procedure"],
              "ids": [options.recipeId.toString()],
              "min_term_freq": 1,
              "max_query_terms": 12,
              "min_word_length": 3
            }
          }
        }
      }
    }
  }, function(err, results, status) {
    results = [];
    if (results && results.hits) {
      results = results.hits.hits || [];
    }
    callback(err, results, status);
  });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllRecipes,
  related: getRelatedRecipes,
  videorecipe: {
    get: getVideoRecipes
  },
  recipe: {
    get: getRecipes
  }
};

exports = module.exports = _service;
