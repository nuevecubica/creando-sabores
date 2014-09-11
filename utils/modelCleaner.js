var util = require('util');

/**
 * Removes a property from the object, goes deeper if is inside another object
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
        console.warn('removeList exception found in %s inside %s', last, prop);
      }
    }
  }
  else {
    console.warn('removeList exception found in %s', prop);
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
        if (paths[key].options && paths[key].options.ref) {
          // console.log('relationship for %s', key);
          removeList(obj, key + 'RefList');
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
