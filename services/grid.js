var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

/**
 * Gets a list of stuff for the grid
 * @param  {Object}   options { section: 'Index' }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getGrid = function(options, callback) {

  options = _.defaults(options || {}, {
    section: 'Index'
  });

  var mkFiller = function(service, field, extraflags) {
    var flags = extraflags || [];
    flags.push('is' + field + 'GridPromoted.value');
    return function(next) {
      service({
        page: 0,
        limit: null,
        flags: flags,
        sort: 'is' + field + 'GridPromoted.position'
      }, function(err, res) {
        next(err, {
          criteria: 'is' + field + 'GridPromoted',
          entries: res
        });
      });
    };
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

  var getSectionPromoted = mkFiller(service.recipeList.recipe.get, options.section);
  var getVideoSectionPromoted = mkFiller(service.recipeList.videorecipe.get, 'Recipes');
  var getVideoIndexPromoted = mkFiller(service.recipeList.videorecipe.get, 'Index');
  var getOfficials = mkFiller(service.recipeList.recipe.get, options.section, ['isOfficial']);
  var getContests = mkFiller(service.contestList.get, 'Index');
  var getTips = mkFiller(service.tipList.get, 'Index');
  var getMenus = mkFiller(service.menuList.get, options.section);

  var fillers = [];
  if (options.section === 'Index') {
    fillers = [getContests, getVideoIndexPromoted, getOfficials, getTips, getMenus, getSectionPromoted];
  }
  else if (options.section === 'Videorecipes') {
    fillers = [getVideoSectionPromoted];
  }
  else if (options.section === 'Recipes') {
    fillers = [getOfficials, getSectionPromoted];
  }
  else if (options.section === 'Menus') {
    fillers = [getMenus];
  }
  async.parallel(fillers, makeGrid);

};

/*
  Set exportable object
 */
var _service = {
  get: getGrid

};

exports = module.exports = _service;
