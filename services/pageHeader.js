var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

/**
 * Gets the recipe for the Recipes section header
 * @param  {Object}   options { sort: '-publishDate' }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderRecipe = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Recipe.model.findOne();

  query.where('state', 'published');
  query.where('isRecipesHeaderPromoted', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Gets the recipe for the Homepage header
 * @param  {Object}   options { sort: '-publishDate' }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderHome = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Recipe.model.findOne();

  query.where('state', 'published');
  query.where('isIndexHeaderPromoted', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getHeaderHome
};
_service.recipe = {
  get: getHeaderRecipe
};
_service.home = {
  get: getHeaderHome
};

exports = module.exports = _service;
