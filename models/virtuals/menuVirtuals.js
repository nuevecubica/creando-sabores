var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

var defaults = {
  images: {
    header: '/images/default_menu.jpg'
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
    media: {
      header: {
        src: function(options) {
          return src(that.media.header, options);
        }
      }
    }
  };
};

var virtuals = {
  canBeShown: function() {
    return (['banned', 'removed'].indexOf(this.state) === -1);
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
      'list': this._.media.header.src({
        transformation: 'list_thumb'
      }) || this._.media.collage || defaults.images.header,
      'grid_small': this._.media.header.src({
        transformation: 'grid_small_thumb'
      }) || this._.media.collage || defaults.images.header,
      'grid_medium': this._.media.header.src({
        transformation: 'grid_medium_thumb'
      }) || this._.media.collage || defaults.images.header,
      'grid_large': this._.media.header.src({
        transformation: 'grid_large_thumb'
      }) || this._.media.collage || defaults.images.header,
      'header': this._.media.header.src({
        transformation: 'header_limit_thumb'
      }) || this._.media.collage || defaults.images.header,
      'shopping_list': this._.media.header.src({
        transformation: 'shopping_list_thumb'
      }) || this._.media.collage || defaults.images.header,
      'hasQuality': imageQuality(this.header).hasQuality
    };
  },
  /**
   * Item's URL
   * @return {String} URL
   */
  url: function() {
    return '/menu/' + this.slug;
  },
  /**
   * Item's type
   * @return {String} type
   */
  type: function() {
    return 'menu';
  },
  /**
   * CSS classes
   * @return {String} CSS classes
   */
  classes: function(asArray) {
    var classes = ['menu'];
    classes.push('state-' + this.state);
    return asArray ? classes : classes.join(' ');
  }
};

exports = module.exports = _.extend({}, virtuals, {
  _apply: applyVirtuals._apply(virtuals)
});
