var _ = require('underscore');

var iterate = function(obj, fields, _dest) {
  var field = fields.shift();
  console.log('iterate field', field, fields, _dest[field] || null);
  var _new = _dest[field] || {};
  if (!_.isObject(obj)) {
    return obj;
  }
  else if (obj[field]) {
    if (fields.length) {
      _new[field] = iterate(obj[field], fields, _dest[field] || {});
    }
    else {
      _new[field] = obj[field];
    }
  }
  return _new;
};

/**
 * Show only these fields
 * @param  {Object} apiObject Original object
 * @param  {Object} allowedFields Array or object of allowed fields.
 * @return {Object} A new and clean object
 */
var hideMyApi = function(apiObject, allowedFields) {
  var cleanObject = {};

  if (_.isArray(allowedFields)) {
    allowedFields.forEach(function(field) {
      if (field.indexOf('.') === -1) {
        if (apiObject[field]) {
          cleanObject[field] = apiObject[field];
        }
      }
      else {
        var fields = field.split('.');
        console.log('fields', fields);
        cleanObject = _.extend(cleanObject, iterate(apiObject, fields, cleanObject));
      }
    });
  }
  return cleanObject;
};

module.exports = exports = hideMyApi;
