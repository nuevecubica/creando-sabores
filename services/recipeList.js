var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

/**
 * Reads recipes from the database
 * @param  {Object}   options { userId: null, all: false, sort: '-rating',
 *                              flags: [], page: 1, perPage: 10, limit: 10,
 *                              fromContests: false }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getRecipes = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    userId: null,
    all: false,
    sort: '-rating',
    flags: [],
    page: 1,
    perPage: 10,
    limit: 10,
    fromContests: false
  });

  var query = {};

  if (!options.page) {
    query = Recipe.model.find();
    if (options.limit || options.perPage) {
      query.limit(options.limit || options.perPage);
    }
  }
  else {
    query = Recipe.paginate({
      page: options.page,
      perPage: options.perPage
    });
  }

  if (options.userId) {
    console.log('author', options.userId);
    query.where('author', options.userId);
  }

  if (!options.all) {
    query.where('isBanned', false);
    query.where('state', 1);
  }

  query.where('isRemoved', false);

  if (!options.fromContests) {
    query.where('contest.id', null);
  }
  else if (!options.all) {
    query.or([{
      'contest.id': null
    }, {
      'contest.state': 'admited'
    }]);
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

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Gets a list of recipes for the grid
 * @param  {Object}   options { section: 'Recipes' }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getRecipesGrid = function(options, callback) {

  options = _.defaults(options || {}, {
    section: 'Recipes'
  });

  getRecipes({
    page: 0,
    limit: 10,
    flags: ['is' + options.section + 'GridPromoted.value'],
    sort: 'is' + options.section + 'GridPromoted.position'
  }, function(err, resultsGrid) {
    getRecipes({
      page: 0,
      limit: 10,
      flags: ['isOfficial', 'is' + options.section + 'GridPromoted.value'],
      sort: 'is' + options.section + 'GridPromoted.position'
    }, function(err, resultsChef) {
      // Initialize empty array
      var results = new Array(10);

      // Load official recipes
      for (var i = 0, l = resultsChef.length; i < l; i++) {
        results[resultsChef[i].isRecipesGridPromoted.position] = resultsChef[i];
      }
      // Load regular recipes on empty spaces
      for (var j = 0, m = resultsGrid.length; j < m; j++) {
        if (!results[resultsGrid[j].isRecipesGridPromoted.position]) {
          results[resultsGrid[j].isRecipesGridPromoted.position] = resultsGrid[j];
        }
      }
      callback(err, results);
    });
  });
};

/*
  Set exportable object
 */
var _service = {
  get: getRecipes
};
_service.grid = {
  get: getRecipesGrid
};

exports = module.exports = _service;
