var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

var defaults = {
  images: {
    header: '/images/default_menu.jpg'
  },
  thumb: {
    header: {
      width: 1920,
      height: 800,
      max: 5
    },
    list: {
      width: 600,
      height: 196,
      max: 3
    },
    grid_small: {
      width: 300,
      height: 300,
      max: 3
    },
    grid_medium: {
      width: 600,
      height: 300,
      max: 3
    },
    grid_large: {
      width: 600,
      height: 600,
      max: 3
    },
    shopping_list: {
      width: 690,
      height: 515,
      max: 3
    }
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

/**
 * Generates a collage URL from a list of images
 * @param  {Array}   images     Array of cloudinary image ids
 * @param  {Integer} destWidth  Destination width (Default: header width)
 * @param  {Integer} destHeight Destination height (Default: header height)
 * @param  {Integer} maxImages  Maximum number of images to glue
 * @return {String}             URL
 */
var collageUrl = function(images, destWidth, destHeight, maxImages) {
  if (maxImages && images.length > maxImages) {
    images = images.slice(0, maxImages);
  }
  var collage = '';

  if (images && images.length) {
    var width = (destWidth || defaults.thumb.header.width) / images.length;
    var height = (destHeight || defaults.thumb.header.height);
    var transformation = [];

    var _images = images.slice(0);
    var first = _images.shift() + '.jpg';

    transformation.push({
      width: width,
      height: height,
      crop: "fill"
    });

    _.each(_images, function(element, index) {
      var total_width = (index + 1) * width;
      transformation.push({
        overlay: element,
        width: width,
        height: height,
        x: ((total_width + width) / 2),
        crop: "fill"
      });
    });

    collage = cloudinary.url(first, {
      transformation: transformation
    });
  }

  return collage;
};

/**
 * Returns a collage URL from a list of images
 * @param  {Array}  images Array of cloudinary image ids
 * @param  {String} thumb  Thumbnail name
 * @return {String}        URL
 */
var getCollage = function(images, thumb) {
  if (!_.isArray(images)) {
    return '';
  }
  return collageUrl(images, defaults.thumb[thumb].width, defaults.thumb[thumb].height, defaults.thumb[thumb].max);
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

    if (this.media.header && this.media.header.public_id) {

      if (!this._ || !this._.header || 'function' !== typeof this._.header.src) {
        this._ = fakeUnderscore.call(this);
      }

      return {
        'list': this._.media.header.src({
          transformation: 'list_thumb'
        }),
        'grid_small': this._.media.header.src({
          transformation: 'grid_small_thumb'
        }),
        'grid_medium': this._.media.header.src({
          transformation: 'grid_medium_thumb'
        }),
        'grid_large': this._.media.header.src({
          transformation: 'grid_large_thumb'
        }),
        'header': this._.media.header.src({
          transformation: 'header_limit_thumb'
        }),
        'header_vertical': this._.media.header.src({
          transformation: 'header_vertical_thumb'
        }),
        'shopping_list': this._.media.header.src({
          transformation: 'shopping_list_thumb'
        }),
        'hasQuality': imageQuality(this.media.header).hasQuality,
        'isVertical': imageQuality(this.media.header).isVertical
      };
    }
    else {
      return {
        'list': getCollage(this.media.collage, 'list') || defaults.images.header,
        'grid_small': getCollage(this.media.collage, 'grid_small') || defaults.images.header,
        'grid_medium': getCollage(this.media.collage, 'grid_medium') || defaults.images.header,
        'grid_large': getCollage(this.media.collage, 'grid_large') || defaults.images.header,
        'header': getCollage(this.media.collage, 'header') || defaults.images.header,
        'shopping_list': getCollage(this.media.collage, 'shopping_list') || defaults.images.header,
        'hasQuality': (this.media.collage && this.media.collage.length) ? true : false,
        'isVertical': false
      };
    }
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
