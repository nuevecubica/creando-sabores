var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  Videorecipe = keystone.list('Videorecipe');

/**
 * Reads recipes from the database
 * @param  {Object}   options { userId: null, all: false, sort: '-rating',
 *                              flags: [], page: 1, perPage: 10, limit: 10,
 *                              fromContests: false, states: ['published'] }
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
    fromContests: false,
    collection: Recipe,
    states: ['published']
  });

  var query = {};

  if (!options.page) {
    query = options.collection.model.find();
    if (options.limit || options.perPage) {
      query.limit(options.limit || options.perPage);
    }
  }
  else {
    query = options.collection.paginate({
      page: options.page,
      perPage: options.perPage
    });
  }

  if (options.userId) {
    query.where('author', options.userId);
  }

  var states = options.states || [];

  if (options.all) {
    states.push('draft');
    states.push('review');
    states.push('banned');
  }

  if (states.length) {
    query.in('state', states);
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

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Reads videorecipes from the database. Uses getRecipes internally.
 */
var getVideoRecipes = function(options, callback) {
  options.collection = Videorecipe;
  getRecipes(options, callback);
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
    }, next);
  };

  var getVideoSectionPromoted = function(next) {
    getVideoRecipes({
      page: 0,
      limit: 10,
      flags: ['is' + options.section + 'GridPromoted.value'],
      sort: 'is' + options.section + 'GridPromoted.position'
    }, next);
  };

  var getOfficials = function(next) {
    getRecipes({
      page: 0,
      limit: 10,
      flags: ['isOfficial', 'is' + options.section + 'GridPromoted.value'],
      sort: 'is' + options.section + 'GridPromoted.position'
    }, next);
  };

  var makeGrid = function(err, results) {
    // Initialize empty array
    var grid = new Array(10);

    // Load in descending priority order
    var criteria = 'is' + options.section + 'GridPromoted';
    for (var i = 0, l = results.length; i < l; i++) {
      var result = results[i];
      for (var j = 0, l2 = result.length; j < l2; j++) {
        var pos = result[j][criteria].position;
        if (!grid[pos]) {
          grid[pos] = result[j];
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
  get: getRecipes,
  grid: {
    get: getRecipesGrid
  },
  video: {
    get: getVideoRecipes
  }
};

exports = module.exports = _service;
