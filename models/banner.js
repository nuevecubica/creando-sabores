var _ = require('underscore'),
  keystone = require('keystone'),
  virtual = require('./virtuals'),
  Types = keystone.Field.Types,
  modelCleaner = require(__base + 'utils/modelCleaner');

/**
 * Banner
 * ======
 */

var Banner = new keystone.List('Banner', {
  map: {
    name: 'text'
  },
});

Banner.add({

    prefix: {
      type: Types.Text,
      initial: true,
      required: true
    },

    text: {
      type: Types.Text,
      initial: true,
      required: true
    },

    url: {
      type: Types.Text,
      initial: true,
      required: true
    }

  },

  'Status', {
    published: {
      type: Types.Boolean,
      label: 'Enable',
      default: true
    },

    publishedDate: {
      type: Types.Date,
      required: true,
      default: Date.now,
      hidden: true
    }
  }

);

Banner.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Pre Save HOOK
Banner.schema.pre('save', function(next) {

  // Set rating field
  if (this.isModified('published') && this.published) {
    this.publishedDate = Date.now;
  }

});

/**
 * Registration
 * ============
 */
Banner.defaultColumns = 'text, url, published, publishedDate';
Banner.register();
