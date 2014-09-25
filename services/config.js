var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Config = keystone.list('Config'),
  defaults = require('./config.defaults');

/**
 * Returns config parameters, optionally filtered by an array
 * @param  {Object}   options { names: [] }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getConfigs = function(options, callback) {
  options = _.defaults(options || {}, {
    names: []
  });
  var list = {};
  if (options.names > 0) {
    list = {
      name: {
        $in: []
      }
    };
    _.each(options.names, function(name) {
      list.name.$in.push(name);
    });
  }
  var query = Config.model.find(list);
  query.exec(callback || function() { /* dummy */ });
};

/**
 * Returns config parameters for a grid
 * @param  {Object}   options { section: 'home' }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getConfigsGrid = function(options, callback) {

  options = _.defaults(options || {}, {
    section: 'home'
  });

  var names = [
    'grid_order_desktop_' + options.section,
    'grid_order_tablet_' + options.section,
    'grid_order_mobile_' + options.section,
    'grid_size_desktop_' + options.section,
    'grid_size_tablet_' + options.section,
    'grid_size_mobile_' + options.section
  ];
  getConfigs({
    names: names
  }, function(err, results) {
    var order = {};
    var sizes = {};
    if (!err && results) {
      for (var i = 0, l = results.length; i < l; i++) {
        if (results[i].name.indexOf('grid_order') >= 0) {
          order[results[i].name] = results[i].value;
        }
        else {
          sizes[results[i].name] = results[i].value;
        }
      }
      for (var j = 0, m = names.length; j < m; j++) {
        if (names[j].indexOf('grid_order') >= 0) {
          if (!order[names[j]]) {
            order[names[j]] = defaults[names[j]];
          }
        }
        else {
          if (!order[names[j]]) {
            sizes[names[j]] = defaults[names[j]];
          }
        }
      }
    }
    callback(err, {
      order: order,
      sizes: sizes
    });
  });
};

/**
 * Gets the config variables for the grid at Recipes' home
 * @param  {Object}   options {}
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getConfigsGridRecipes = function(options, callback) {
  getConfigsGrid({
    section: 'recipes'
  }, callback);
};

/**
 * Gets the config variables for the grid at Homepage
 * @param  {Object}   options {}
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getConfigsGridHome = function(options, callback) {
  getConfigsGrid({
    section: 'home'
  }, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getConfigs
};
_service.grid = {
  get: getConfigsGrid
};
_service.grid.home = {
  get: getConfigsGridHome
};
_service.grid.recipes = {
  get: getConfigsGridRecipes
};

exports = module.exports = _service;
