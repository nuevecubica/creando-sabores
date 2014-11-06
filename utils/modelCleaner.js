var util = require('util');

/**
 * Removes a property from the object, goes deeper if it's inside another object
 * @param  {model} obj
 * @param  {string} prop
 * @return {model}
 */
var removeList = function(obj, prop) {
  // Deletes prop if it exists
  if (obj.hasOwnProperty(prop)) {
    obj[prop] = null;
    delete obj[prop];
  }
  // Or goes deeper if it's inside another object
  else if (prop.indexOf('.') !== -1) {
    var subPath = prop.split('.');
    if (subPath.length > 0) {
      var subObj = obj;
      // The latest is the list, skip it
      for (var n = 0, l = subPath.length - 1; n < l; ++n) {
        subObj = subObj[subPath[n]];
      }
      var last = subPath[subPath.length - 1];
      // Removes the property if it exists
      if (subObj.hasOwnProperty(last)) {
        subObj[last] = null;
        delete subObj[last];
      }
      else {
        logger.warn('removeList exception found in %s inside %s', last, prop);
      }
    }
  }
  else {
    logger.warn('removeList exception found in %s', prop);
  }
  return obj;
};

/**
 * Looks for lists inside the model's schema and removes them
 * @param  {model} obj
 * @return {model}
 */
var removeLists = function(obj) {
  if (obj.list) {
    // Reads all the paths from `list.schema.paths`
    var paths = obj.list.schema.paths;
    for (var key in paths) {
      if (paths.hasOwnProperty(key)) {
        // Looks for the `ref` option to find Relationships
        // logger.log('key %s', key, paths[key].options || 'no options');
        if (paths[key].options) {
          if (paths[key].options.ref) {
            // logger.log('relationship for %s', key);
            removeList(obj, key + 'RefList');
          }
          // Looks for `many: true` Relationships
          else if (Array.isArray(paths[key].options.type)) {
            var types = paths[key].options.type;
            for (var i = 0, l = types.length; i < l; ++i) {
              var type = types[i];
              if (type && type.ref) {
                // logger.log('relationship for %s', key);
                removeList(obj, key + 'RefList');
                break;
              }
            }
          }
        }
      }
    }
    removeList(obj, 'list');
  }
  return obj;
};

/**
 * Callback for `transform` inside models
 * @param  {document} doc
 * @param  {model} ret
 * @param  {object} options
 * @return {model}
 */
var transformer = function(doc, ret, options) {
  return removeLists(ret);
};

module.exports = {
  transformer: transformer
};
