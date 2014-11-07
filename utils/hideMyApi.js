var _ = require('underscore');

/**
 * Recursive field copier
 * @param  {Object} source Source object
 * @param  {Array}  fields Array of child fields
 * @param  {Object} _dest  Destination object, to get the actual value of a field
 * @return {Object}        A new object with those fields
 */
var deepAddField = function(source, fields, _dest) {
  var field = fields.shift();
  // logger.log('iterate field', field, fields, _dest[field] || null);
  var _new = _dest || {};
  if (!_.isObject(source)) {
    return source;
  }
  else if (source[field]) {
    if (fields.length) {
      _new[field] = deepAddField(source[field], fields, _dest[field] || {});
    }
    else {
      _new[field] = source[field];
    }
  }
  return _new;
};

/**
 * Show only these fields
 * @param  {Object} apiObject Original object
 * @param  {Object} allowedFields Array of allowed fields or '*'.
 * @param  {Object} disallowedFields (Optional) Array of disallowed fields or '*'.
 * @return {Object} A new and clean object
 */
var hideMyApi = function(apiObject, allowedFields, disallowedFields) {
  var cleanObject = {};

  if (_.isArray(allowedFields) && allowedFields.length) {
    allowedFields.forEach(function(field) {
      if (field.indexOf('.') === -1) {
        if (apiObject[field]) {
          cleanObject[field] = apiObject[field];
        }
      }
      else {
        var fields = field.split('.');
        cleanObject = deepAddField(apiObject, fields, cleanObject);
      }
    });
  }
  // Allow everything
  else if (allowedFields === '*') {
    cleanObject = apiObject;
  }

  if (_.isArray(disallowedFields) && disallowedFields.length) {
    disallowedFields.forEach(function(field) {
      if (field.indexOf('.') === -1) {
        if (apiObject[field]) {
          delete cleanObject[field];
        }
      }
      else {
        var fields = field.split('.');
        var l = fields.length - 1,
          _next = cleanObject;
        fields.forEach(function(field, i) {
          if (i === l) {
            delete _next[field];
          }
          else {
            _next = _next[field];
          }
        });
      }
    });
  }
  // Disallow everything :?
  else if (disallowedFields === '*') {
    cleanObject = {};
  }

  return cleanObject;
};

module.exports = exports = hideMyApi;
