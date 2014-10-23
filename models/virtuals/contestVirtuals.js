var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

var defaults = {
  images: {
    imageContest: '/images/default_contest.jpg',
    header: '/images/default_contest.jpg',
    headerBackgroundRecipe: '/images/default_contest.jpg'
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
    },
    imageContest: {
      src: function(options) {
        return src(that.imageContest, options);
      }
    },
    headerBackgroundRecipe: {
      src: function(options) {
        return src(that.headerBackgroundRecipe, options);
      }
    }
  };
};

var virtuals = {
  canBeShown: function() {
    return (['submission', 'programmed', 'votes', 'closed', 'finished'].indexOf(this.state) === -1);
  },
  /**
   * Cloudinary URL with transformation or default image
   * @return {String} URL
   */
  thumb: function() {
    return {
      'list': this._.imageContest.src({
        transformation: 'list_thumb'
      }) || defaults.images.imageContest,
      'grid_small': this._.imageContest.src({
        transformation: 'grid_small_thumb'
      }) || defaults.images.imageContest,
      'grid_medium': this._.imageContest.src({
        transformation: 'grid_medium_thumb'
      }) || defaults.images.imageContest,
      'grid_large': this._.imageContest.src({
        transformation: 'grid_large_thumb'
      }) || defaults.images.imageContest,
      'header': this._.header.src({
        transformation: 'header_limit_thumb'
      }) || defaults.images.header,
      'header_recipe': this._.headerBackgroundRecipe.src({
        transformation: 'header_limit_thumb'
      }) || defaults.images.headerBackgroundRecipe,
      'hasQuality': imageQuality(this.header).hasQuality
    };
  },
  /**
   * CSS classes
   * @return {String} CSS classes
   */
  classes: function(asArray) {
    var classes = ['contest', 'state-' + this.state];
    return asArray ? classes : classes.join(' ');
  },
  /**
   * Item's URL
   * @return {String} URL
   */
  url: function() {
    return '/concurso/' + this.slug;
  },
  /**
   * Item's type
   * @return {String} type
   */
  type: function() {
    return 'contest';
  }
};

exports = module.exports = _.extend({}, virtuals, {
  _apply: applyVirtuals._apply(virtuals)
});
