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
    states: ['published']
  });

  if (options.all) {
    options.states.push('draft');
  }

  var query = queryMaker(SeasonList, options);

  query.exec(callback || function() { /* dummy function */ });
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
