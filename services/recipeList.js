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
 * Gets a list of recipes for the grid
 * @param  {Object}   options { section: 'Recipes' }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getRecipesGrid = function(options, callback) {

  options = _.defaults(options || {}, {
    section: 'Recipes'
  });

  var getSectionPromoted = function(next) {
    getRecipes({
      page: 0,
      limit: 10,
      flags: ['is' + options.section + 'GridPromoted.value'],
      sort: 'is' + options.section + 'GridPromoted.position'
    }, function(err, res) {
      next(err, {
        criteria: 'is' + options.section + 'GridPromoted',
        entries: res
      });
    });
  };

  var getVideoSectionPromoted = function(next) {
    getVideoRecipes({
      page: 0,
      limit: 10,
      flags: ['isRecipesGridPromoted.value'],
      sort: 'isRecipesGridPromoted.position'
    }, function(err, res) {
      next(err, {
        criteria: 'isRecipesGridPromoted',
        entries: res
      });
    });
  };

  var getVideoIndexPromoted = function(next) {
    getVideoRecipes({
      page: 0,
      limit: 10,
      flags: ['isIndexGridPromoted.value'],
      sort: 'isIndexGridPromoted.position'
    }, function(err, res) {
      next(err, {
        criteria: 'isIndexGridPromoted',
        entries: res
      });
    });
  };

  var getOfficials = function(next) {
    getRecipes({
      page: 0,
      limit: 10,
      flags: ['isOfficial', 'is' + options.section + 'GridPromoted.value'],
      sort: 'is' + options.section + 'GridPromoted.position'
    }, function(err, res) {
      next(err, {
        criteria: 'is' + options.section + 'GridPromoted',
        entries: res
      });
    });
  };

  var makeGrid = function(err, results) {
    // Initialize empty array
    var grid = new Array(10);

    // Load in descending priority order
    for (var i = 0, l = results.length; i < l; i++) {
      var entries = results[i].entries;
      var criteria = results[i].criteria;
      for (var j = 0, l2 = entries.length; j < l2; j++) {
        var pos = entries[j][criteria].position;
        if (!grid[pos]) {
          grid[pos] = entries[j];
        }
      }
    }
    callback(err, grid);
  };

  var fillers = [getOfficials, getSectionPromoted];
  if (options.section === 'Videorecipes') {
    fillers = [getVideoSectionPromoted];
  }
  else if (options.section === 'Index') {
    fillers = [getVideoIndexPromoted, getOfficials, getSectionPromoted];
  }
  async.parallel(fillers, makeGrid);

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
    if (results) {
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
  grid: {
    get: getRecipesGrid
  },
  videorecipe: {
    get: getVideoRecipes
  },
  recipe: {
    get: getRecipes
  }
};

exports = module.exports = _service;
