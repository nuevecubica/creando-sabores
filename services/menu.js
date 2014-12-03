var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  clean = require(__base + 'utils/cleanText.js'),
  config = require(__base + 'configs/editor'),
  service = require('./index');

var defaults = {
  description: '',
  state: 'draft',
  plates: []
};

/**
 * Reads a menu from the database
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {null}
 */
var getMenu = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    states: ['published'],
    populate: ['author']
  });

  if (options.slug) {

    service.menuList.get(options, function(err, result) {
      if (!err && result) {
        data.menu = _.defaults(result, defaults);
        data.menu._document = result;

        if (options.user && result.author) {
          // Am I the owner?
          data.own = (options.user._id.toString() === result.author._id.toString()) || options.user.isAdmin;
        }
        else {
          data.own = false;
        }

        if (
          (['draft'].indexOf(result.state) >= 0 && !data.own) || // Drafts only for the owner
          ['removed', 'banned'].indexOf(result.state) >= 0
        ) {
          return callback(err || 'Not found', null);
        }

        return callback(null, data);
      }
      else {
        if (err) {
          logger.error('Error service.menu.read find', err);
        }
        return callback(err || 'Not found', {});
      }
    });
  }
  else {
    return callback('Not found', data);
  }
};

/**
 * Returns an array of menus with recipes. Recipes are filtered.
 * @param  {Object}   options  options
 * @param  {String}   state    state
 * @param  {Function} callback callback
 */
var getMenuWithRecipes = function(options, callback) {
  options = _.defaults(options || {}, {
    states: ['published'],
    populate: ['author', 'plates']
  });

  return getMenu(options, function(err, result) {
    if (!err && result && result.menu && result.menu.plates) {

      result.menu.plates.forEach(function(plate, i) {

        if (['draft', 'review', 'removed', 'banned'].indexOf(plate.state) >= 0) {
          result.menu.plates[i] = {
            title: 'Unavailable',
            slug: null,
            url: null,
            description: 'Unavailable',
            unavailable: true,
            state: 'unavailable',
            classes: ('string' === typeof plate.classes) ? (plate.classes + ' unavailable') : plate.classes.push('unavailable')
          };
        }

      });

    }
    callback(err, result);
  });
};

/**
 * Changes the menu state
 * @param  {Object}   options  options
 * @param  {String}   state    state
 * @param  {Function} callback callback
 */
var changeState = function(options, state, callback) {

  service.menuList.get(options, function(err, menu) {

    if (!err && menu) {
      menu.state = state;
      menu.save(callback);
    }
    else {
      if (err) {
        logger.error('Error service.menu.read find', err);
      }
      return callback(err || 'Not found', {});
    }
  });
};

/**
 * Transforms, cleans and returns menu data object
 * @param  {object} req
 * @param  {orig} orig Original model fields
 * @return {object}      Cleaned data object
 */
var menuData = function(req, orig) {

  // Clean data
  var data = {};
  var prop, props = ['title', 'description', 'plates'];
  var file, files = ['media.header_upload'];

  // Something in the request body?
  var something = false;
  var i, l = props.length;
  for (i = 0; i < l; i++) {
    prop = props[i];
    if (req.body[prop]) {
      something = true;
      break;
    }
  }

  if (req.body.files) {
    var j, m = files.length;
    for (j = 0; j < m; j++) {
      if (files[j]) {
        file = files[j];
        if (req.body.files[file]) {
          something = true;
          break;
        }
      }
    }
  }

  // Empty body
  if (!something) {
    data = null;
  }

  // Parse body
  else {
    data.title = clean(req.body.title, ['plaintext', 'oneline', ['maxlength', config.menu.title.length]]);
    data.description = clean(req.body.description, ['oneline', ['maxlength', config.menu.description.length], 'escape']);
    data.plates = (req.body.plates) ? req.body.plates.split(',') : [];
    data.author = req.user.id;

    // Get missing data from original if present
    if (orig) {
      for (i = 0; i < l; i++) {
        prop = props[i];
        if (!data[prop]) {
          data[prop] = orig[prop];
        }
      }
    }
  }
  return data;
};

/**
 * Returns an empty menu
 * @param  {Object} options
 * @param  {Function} callback
 * @return {null}
 */
var getMenuNew = function(options, callback) {
  var data = {};

  options = options || {};

  data = {
    menu: defaults
  };

  if (options.predefinedPlate) {
    service.recipe.get({
      slug: options.predefinedPlate,
      fromContests: true
    }, function(err, res) {
      data.menu.plates = [res.recipe];
      return callback(null, data);
    });
  }
  else {
    return callback(null, data);
  }

};

/**
 * Saves a menu into database
 * @param  {object}   menu     Menu params
 * @param  {object}   options  Options for save menu
 * @param  {function} callback
 * @return {null}
 */
var saveMenu = function(menu, options, callback) {

  options = _.defaults(options || {}, {
    req: null,
    fields: 'title,description,plates,author,media.header'
  });

  // Data
  var data = menuData(options.req, menu);

  if (data === null) {
    return callback('Missing data');
  }

  // Load plates by slug so the updateHandler can save them
  service.recipeList.get({
    slug: data.plates,
    limit: config.menu.recipes.length,
    fromContests: true
  }, function(err, plates) {
    if (!err && plates) {
      // Save
      data.plates = plates.results;
      menu.getUpdateHandler(options.req).process(data, {
        fields: options.fields
      }, callback);
    }
    else {
      callback(err, null);
    }
  });

};

/*
  Set exportable object
 */
var _service = {
  get: getMenu,
  state: changeState,
  save: saveMenu
};

_service.get.new = getMenuNew;
_service.get.withRecipes = getMenuWithRecipes;

exports = module.exports = _service;
