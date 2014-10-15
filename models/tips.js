var _ = require('underscore'),
  config = require(__base + 'config.js'),
  keystone = require('keystone'),
  mongoosastic = require('mongoosastic'),
  virtual = require('./virtuals'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require(__base + 'utils/modelCleaner');

/**
 * Tip
 * ======
 */

var Tip = new keystone.List('Tip', {
  map: {
    name: 'title'
  },
  autokey: {
    path: 'slug',
    from: 'title',
    unique: true,
    fixed: true
  }
});

Tip.add({
    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true,
      note: 'Should be less than 12 chars to be promoted',
      es_boost: 5
    },

    // Needed for Mongoosastic
    slug: {
      type: Types.Text,
      es_type: "string",
      hidden: true
    },

    author: {
      type: Types.Relationship,
      ref: 'User',
      filters: {
        'isChef': true
      },
      index: true,
      es_type: "objectid"
    },

    tip: {
      type: Types.Html,
      wysiwyg: true,
      trim: true
    },

    scoreTotal: {
      type: Types.Number,
      noedit: true,
      default: 0,
      es_type: "integer"
    },

    scoreCount: {
      type: Types.Number,
      noedit: true,
      default: 0,
      es_type: "integer"
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.TIPS_SCHEMA_VERSION
    }
  },

  'Media', {
    header: {
      type: Types.CloudinaryImage,
      note: 'Minimum resolution: 1280 x 800'
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'published'],
      default: 'draft',
      es_type: "string"
    },

    publishedDate: {
      type: Types.Date,
      dependsOn: {
        state: 'published'
      },
      es_type: "date",
      es_boost: 4
    }
  });

// Virtuals
Tip.schema.virtual('rating').get(virtual.recipe.rating);
Tip.schema.virtual('url').get(virtual.recipe.url);
Tip.schema.virtual('thumb').get(virtual.recipe.thumb);
Tip.schema.virtual('classes').get(virtual.recipe.classes);

// Pre Save HOOK
Tip.schema.pre('save', function(next) {

  if ((!this.tip || !this.author) && this.state === 'published') {
    this.state = 'draft';
    this.publishedDate = null;
  }

  if (this.isModified('state') && this.state === 'published') {
    this.publishedDate = new Date();
  }

  next();

});

/**
 * Registration
 * ============
 */
Tip.defaultColumns = 'title, author, state, publishedDate';
Tip.schema.plugin(mongoosastic, {
  host: config.elasticsearch.host,
  port: config.elasticsearch.port,
  log: config.elasticsearch.log
});
Tip.register();
