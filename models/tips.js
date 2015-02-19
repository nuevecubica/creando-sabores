var _ = require('underscore'),
  config = require(__base + 'config.js'),
  keystone = require('keystone'),
  mongoosastic = require('mongoosastic'),
  virtual = require('./virtuals'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require(__base + 'utils/modelCleaner');

// ===== Defaults
// Define tip defaults
var defaults = {
  positions: (function() {
    var arr = [];
    for (var i = 0; i < 10; ++i) {
      arr.push({
        value: i,
        label: "Position " + (i + 1)
      });
    }
    return arr;
  })()
};

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
  },
  link: ['/tip/{slug}', {
    href: '/tips',
    lable: 'open tips home'
  }]
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

    rating: {
      type: Types.Number,
      default: 0,
      noedit: true,
      es_type: "integer"
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
  },

  'Promoted', {
    isPromoted: {
      type: Types.Boolean,
      label: 'Promoted',
      hidden: true,
      default: false,
      es_type: "boolean"
    },

    isIndexHeaderPromoted: {
      type: Types.Boolean,
      label: 'Index header promoted',
      default: false,
      es_type: "boolean"
    },

    isIndexGridPromoted: {
      value: {
        type: Types.Boolean,
        label: 'Index Grid',
        default: false,
        es_type: "boolean"
      },

      position: {
        type: Types.Select,
        numeric: true,
        options: defaults.positions,
        label: 'Index Grid Position',
        dependsOn: {
          'isIndexGridPromoted.value': true
        },
        default: 0,
        es_type: "integer"
      }
    },

    isTipsHeaderPromoted: {
      type: Types.Boolean,
      label: 'Tips header promoted',
      default: false,
      es_type: "boolean"
    }
  });

Tip.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Virtuals
//Tip.schema.virtual('rating').get(virtual.tip.rating);
Tip.schema.virtual('url').get(virtual.tip.url);
Tip.schema.virtual('type').get(virtual.tip.type);
Tip.schema.virtual('thumb').get(virtual.tip.thumb);
Tip.schema.virtual('classes').get(virtual.tip.classes);

// Pre Save HOOK
Tip.schema.pre('save', function(next) {

  // Set isPromoted if tip is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value || this.isTipsHeaderPromoted.value) {
    this.isPromoted = true;
  }

  // Set rating field
  if (this.isModified('scoreTotal') || this.isModified('scoreCount')) {
    this.rating = (this.scoreTotal !== undefined || this.scoreCount > 0) ? (this.scoreTotal / this.scoreCount) : 0;
  }

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
