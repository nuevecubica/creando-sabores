var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Menu = keystone.list('Menu'),
  service = require('./index');

var defaults = {
  description: '',
  state: 'draft',
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
    states: ['published']
  });

  if (options.slug) {

    service.menuList.get(options, function(err, result) {
      if (!err && result) {
        data.menu = _.defaults(result, defaults);

        if (options.user) {
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
          console.error('Error service.menu.read find', err);
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
 * Returns an empty menu
 * @param  {Object} options
 * @param  {Function} callback
 * @return {null}
 */
var getMenuNew = function(options, callback) {
  var data = {};

  options = options || {};

  data = {
    recipe: defaults
  };
  return callback(null, data);
};

/*
  Set exportable object
 */
var _service = {
  get: getMenu,
};
_service.get.new = getMenuNew;

exports = module.exports = _service;
