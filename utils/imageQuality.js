var _ = require('underscore');

module.exports = function(image, options) {
  var defaults = {
    width: 1280,
    height: 800
  };

  options = _.defaults(options || {}, defaults);

  var hasQuality = false;
  if (image && image.width) {
    if (
      image.width >= options.width &&
      image.height >= options.height &&
      image.width > image.height
    ) {
      hasQuality = true;
    }
  }

  var isVertical = false;
  if (image && image.width) {
    if (image.height >= image.width) {
      isVertical = true;
    }
  }

  return {
    hasQuality: hasQuality,
    isVertical: isVertical
  };
};
