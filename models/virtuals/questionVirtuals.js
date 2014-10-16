var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

var defaults = {
  images: {
    header: '/images/default_recipe.jpg'
  }
};

/**
 * Fake src function extracted from keystone/lib/fieldTypes/cloudinaryimage.js
 * @param  {Cloudinary} item    this
 * @param  {Object}     options Cloudinary options
 * @return {String}             URL
 */
var src = function(item, options) {
  if (!item.public_id) {
    return '';
  }
  options = ('object' === typeof options) ? options : {};
  if (!('fetch_format' in options) && keystone.get('cloudinary webp') !== false) {
    options.fetch_format = 'auto';
  }
  if (!('progressive' in options) && keystone.get('cloudinary progressive') !== false) {
    options.progressive = true;
  }
  if (!('secure' in options) && keystone.get('cloudinary secure')) {
    options.secure = true;
  }
  options.version = item.version;
  return cloudinary.url(item.public_id + '.' + item.format, options);
};

/**
 * Fake Keystone's underscore item methods
 * @return {Object} Keystone's underscore methods
 */
var fakeUnderscore = function() {
  var that = this;
  return {
    header: {
      src: function(options) {
        return src(that.header, options);
      }
    }
  };
};

var virtuals = {
  canBeShown: function() {
    return (['review', 'removed'].indexOf(this.state) === -1);
  },
  /**
   * Item's URL
   * @return {String} URL
   */
  url: function() {
    return '/pregunta/' + this.slug;
  },
};

exports = module.exports = _.extend({}, virtuals, {
  _apply: applyVirtuals._apply(virtuals)
});
