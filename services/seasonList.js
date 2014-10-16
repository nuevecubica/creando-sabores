var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  SeasonList = keystone.list('SeasonList'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

/**
 * Reads seasons from the database
 *
 * @param  {Object}   options { all: false, sort: '-priority',
 *                            flags: [], limit: 10, states: ['published'],
 *                            populate: [], id: null, slug: null }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getSeasons = function(options, callback) {
  options = _.defaults(options || {}, {
    all: false,
    sort: '-priority',
    states: ['published'],
    recipeStates: ['published']
  });

  if (options.all) {
    options.states.push('draft');
  }

  var query = queryMaker(SeasonList, options);

  query.exec(function(err, results) {

    // Clear invalid recipes when populated
    if (!err && results && options.populate && options.populate.length) {
      var recipe = null,
        len = 0;
      if (results.results) {
        results.results.forEach(function(season) {
          len = season.recipes.length;
          while (len--) {
            if (options.recipeStates.indexOf(season.recipes[len].state) === -1) {
              season.recipes.splice(len, 1);
            }
          }
        });
      }
      else {
        len = results.recipes.length;
        while (len--) {
          if (options.recipeStates.indexOf(results.recipes[len].state) === -1) {
            results.recipes.splice(len, 1);
          }
        }
      }
    }

    if (callback) {
      callback(err, results);
    }
  });
};

/**
 * Reads only recipes from the database. Uses getAllRecipes internally.
 * @param  {Object}   options  getAllRecipes options.
 * @param  {Function} callback
 */
var getWithRecipes = function(options, callback) {
  if (!options.populate) {
    options.populate = ['recipes'];
  }
  else if (options.populate.indexOf('recipes') === -1) {
    options.populate.push('recipes');
  }
  getSeasons(options, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getSeasons,
  recipes: {
    get: getWithRecipes
  }
};

exports = module.exports = _service;
