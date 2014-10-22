var _ = require('underscore');
/**
 * Like underscore defaults but this goes deeper
 * @param  {Object} target   [description]
 * @param  {Object} defaults [description]
 * @return {[type]}          [description]
 */
function deepDefaults(target) {
  if (!_.isObject(target)) {
    return target;
  }
  for (var i = 1, length = arguments.length; i < length; i++) {
    var defaults = arguments[i];

    for (var prop in defaults) {
      if (target[prop] === void 0) {
        target[prop] = defaults[prop];
      }
      else if ('object' === typeof target[prop]) {
        if ('object' === typeof defaults[prop]) {
          deepDefaults(target[prop], defaults[prop]);
        }
        else {
          // do nothing
        }
      }
    }
  }
  return target;
}

exports = module.exports = deepDefaults;
