var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

/**
 * Reads both recipes and videorecipes from the database
 * @param  {Object}   options { user: null, all: false, sort: '-rating',
 *                              flags: [], page: 1, perPage: 10, limit: 10,
 *                              fromContests: false, states: ['published'] }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getAllRecipes = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    user: null,
    slug: null, // to query one recipe
    populate: [],
    all: false,
    sort: '-rating',
    flags: [],
    page: 1,
    perPage: 10,
    limit: null,
    fromContests: false,
    states: ['published']
  });

  var query = {};

  if (options.limit) {
    options.perPage = options.limit;
  }

  if (options.limit === 1) {
    query = Recipe.model.findOne();
  }
  else if (!options.page) {
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

  if (options.slug) {
    query.where('slug', options.slug);
  }

  if (options.userId) {
    console.warn('Deprecated call on service.recipeList with options:', options);
    query.where('author', options.userId);
  }
  else if (options.user) {
    query.where('author', options.user._id);
  }

  var states = options.states || [];

  if (options.all) {
    states.push('draft');
    states.push('review');
    states.push('banned');
  }

  if (states.length) {
    states = _.unique(states);
    query.in('state', states);

    // Just in case it requests review recipes, forces fromContest
    if (states.indexOf('review') !== -1) {
      options.fromContests = true;
    }
  }

  if (!options.fromContests) {
    query.where('contest.id', null);
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

  if (options.populate && options.populate.length) {
    options.populate.forEach(function(pop) {
      query.populate(pop);
    });
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Reads only videorecipes from the database. Uses getAllRecipes internally.
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
    fillers = [getVideoSectionPromoted, getOfficials, getSectionPromoted];
  }
  async.parallel(fillers, makeGrid);

};

/*
  Set exportable object
 */
var _service = {
  get: getAllRecipes,
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
