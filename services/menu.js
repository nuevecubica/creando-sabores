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
        data.menu._document = result;

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

/** Change menu state
 * [changeState description]
 * @param  {Object}   options  options
 * @param  {String}   state    state
 * @param  {Function} callback callback
 * @return {null}
 */
var changeState = function(options, state, callback) {
  service.menuList.get(options, function(err, menu) {

    if (!err && menu) {
      menu.state = state;
      menu.save(callback);
    }
    else {
      if (err) {
        console.error('Error service.menu.read find', err);
      }
      return callback(err || 'Not found', {});
    }
  });
};


var menuData = function(user, body, orig) {
  // Clean data
  var data = {};
  var prop, props = ['title', 'description', 'plates'];
  var file, files = ['media.header_upload'];

  // Something in the request body?
  var something = false;
  var i, l = props.length;
  for (i = 0; i < l; i++) {
    prop = props[i];
    if (body[prop]) {
      something = true;
      break;
    }
  }

  if (body.files) {
    var j, m = files.length;
    for (j = 0; j < m; j++) {
      if (files[j]) {
        file = files[j];
        if (body.files[file]) {
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
    data.title = clean(body.title, ['plaintext', 'oneline', ['maxlength', config.menu.title.length], 'escape']);
    data.description = clean(body.description, ['oneline', ['maxlength', config.menu.description.length], 'escape']);
    data.plates = (body.plates) ? body.plates.split(',') : [];
    data.author = user.id;

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
  return callback(null, data);
};


var saveMenu = function(menu, options, callback) {

  var options = _.defaults(options || {}, {
    user: null,
    body: null,
    fields: 'title,description,plates,author,media.header'
  });

  if (options.user !== null || options.body !=== null) {
    // Data
    var data = menuData(options.user, options.body, menu);
    if (data === null) {
      return formResponse(req, res, back, 'Missing data', false);
    }
  }
      return formResponse(req, res, back, 'Missing data', false);


  // Save
  menu.getUpdateHandler(req).process(data, {
    fields: options.fields
  }, callback);
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

exports = module.exports = _service;
