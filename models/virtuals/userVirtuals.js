var keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  imageQuality = require(__base + 'utils/imageQuality'),
  applyVirtuals = require(__base + 'utils/applyVirtuals'),
  _ = require('underscore');

// ===== Defaults
// Define user defaults
var defaults = {
  images: {
    header: '/images/default_user_profile.jpg',
    user: '/images/default_user.png'
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

var getThumb = function(user, origin, size) {

  var image = null;

  if (origin === 'local') {
    image = user._.avatars.local.src({
      transformation: size
    }) || defaults.images.user;
  }
  else if (origin !== 'none') {
    image = user.avatars[origin];
  }
  else {
    image = defaults.images.user;
  }

  return image;
};


var virtuals = {
  thumb: function() {
    return {
      'header': this._.media.header.src({
        transformation: 'header_limit_thumb'
      }) || defaults.images.header,
      'avatar_large': getThumb(this, this.media.avatar.origin, 'avatar_large'),
      'avatar_medium': getThumb(this, this.media.avatar.origin, 'avatar_medium'),
      'avatar_small': getThumb(this, this.media.avatar.origin, 'avatar_small'),
      'hasQuality': imageQuality(this.media.header).hasQuality
    };
  },

  // Provide access to Keystone
  canAccessKeystone: function() {
    return this.isAdmin;
  },

  // Rights to publish
  canPublish: function() {
    return !this.isBanned && (this.isAdmin || this.isConfirmed || this.isChef);
  },

  // Rights to admin
  canAdmin: function() {
    return !this.isBanned && (this.isAdmin || this.isChef);
  },

  // Rights to login
  canLogin: function() {
    return !this.isBanned;
  },

  // URL
  url: function() {
    return '/chef/' + this.username;
  },

  // Hash data
  phrase: function() {
    return this._id + this.email + keystone.get('hash salt');
  }
};

exports = module.exports = _.extend({}, virtuals, {
  _apply: applyVirtuals._apply(virtuals)
});
