var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

var defaults = {
  images: {
    header: '/images/default_tip.jpg'
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
    return (['draft'].indexOf(this.state) === -1);
  },
  /**
   * Cloudinary URL with transformation or default image
   * @return {String} URL
   */
  thumb: function() {
    if (!this._ || !this._.header || 'function' !== typeof this._.header.src) {
      this._ = fakeUnderscore.call(this);
    }
    return {
      'list': this._.header.src({
        transformation: 'list_thumb'
      }) || defaults.images.header,
      'grid_small': this._.header.src({
        transformation: 'grid_small_thumb'
      }) || defaults.images.header,
      'grid_medium': this._.header.src({
        transformation: 'grid_medium_thumb'
      }) || defaults.images.header,
      'grid_large': this._.header.src({
        transformation: 'grid_large_thumb'
      }) || defaults.images.header,
      'header': this._.header.src({
        transformation: 'header_limit_thumb'
      }) || defaults.images.header,
      'shopping_list': this._.header.src({
        transformation: 'shopping_list_thumb'
      }) || defaults.images.header,
      'hasQuality': imageQuality(this.header).hasQuality
    };
  },
  /**
   * Item's URL
   * @return {String} URL
   */
  url: function() {
    return '/tip/' + this.slug;
  },
  /**
   * Item's type
   * @return {String} type
   */
  type: function() {
    return 'tip';
  },
  /**
   * CSS classes
   * @return {String} CSS classes
   */
  classes: function(asArray) {
    var classes = ['tip'];
    classes.push('state-' + this.state);
    return asArray ? classes : classes.join(' ');
  },
  /**
   * Final rating
   * @return {Float} Rating
   */
  rating: function() {
    if (this.scoreCount === undefined || this.scoreCount === 0) {
      return 0;
    }
    return (this.scoreTotal / this.scoreCount);
  }
};

exports = module.exports = _.extend({}, virtuals, {
  _apply: applyVirtuals._apply(virtuals)
});
