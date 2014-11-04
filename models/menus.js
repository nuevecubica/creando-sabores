var _ = require('underscore'),
  config = require(__base + 'config.js'),
  keystone = require('keystone'),
  cloudinary = require('cloudinary'),
  mongoosastic = require('mongoosastic'),
  virtual = require('./virtuals'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require(__base + 'utils/modelCleaner');

// ===== Defaults
// Define tip defaults
var defaults = {
  header: {
    defaultId: 'eoshasibtc05k6bbuynv',
    width: 1920,
    height: 800
  },
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
 * Menu
 * ======
 */

var Menu = new keystone.List('Menu', {
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

Menu.add({
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
      index: true,
      es_type: "objectid"
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
      height: 100,
      es_boost: 4,
      es_type: "string"
    },

    plates: {
      type: Types.Relationship,
      ref: 'Recipe',
      filters: {
        'state': 'published',
      },
      many: true
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.TIPS_SCHEMA_VERSION
    }
  },

  'Media', {
    media: {
      header: {
        type: Types.CloudinaryImage,
        note: 'Minimum resolution: 1280 x 800',
        default: null
      },

      collage: {
        type: Types.Url,
        label: 'Collage',
        noedit: true,
        default: ''
      }
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'published', 'removed', 'banned'],
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

    isMenusHeaderPromoted: {
      type: Types.Boolean,
      label: 'Menus header promoted',
      default: false,
      es_type: "boolean"
    },

    isMenusGridPromoted: {
      value: {
        type: Types.Boolean,
        label: 'Recipes Grid',
        default: false,
        es_type: "boolean"
      },

      position: {
        type: Types.Select,
        numeric: true,
        options: defaults.positions,
        label: 'Menus Grid Position',
        dependsOn: {
          'isMenusGridPromoted.value': true
        },
        default: 0,
        es_type: "integer"
      }
    }
  });

Menu.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Virtuals
Menu.schema.virtual('url').get(virtual.menu.url);
Menu.schema.virtual('thumb').get(virtual.menu.thumb);

// Pre Save HOOK
Menu.schema.pre('save', function(next) {

  // Set isPromoted if tip is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value || this.isMenusHeaderPromoted.value) {
    this.isPromoted = true;
  }

  if ((!this.author || this.plates.length <= 0) && this.state === 'published') {
    this.state = 'draft';
    this.publishedDate = null;
  }

  if (this.isModified('state') && this.state === 'published') {
    this.publishedDate = new Date();
  }

  console.log('HEADER', !this.media.header, this.isModified('media.header'));

  if (!this.media.header || this.isModified('media.header')) {
    console.log('PLATES', this.plates.length, this.plates);

    var me = this;
    if (this.plates.length > 1) {
      var transformation = [];

      var width = defaults.header.width / this.plates.length;
      var height = defaults.header.height;
      var first = null;
      var index = 0;

      async.eachSeries(this.plates, function(plate, callback) {
          keystone.list('Recipe').model.findOne({
            _id: plate
          }).exec(function(err, recipe) {
            if (!err && recipe) {
              console.log('ELEMENT', recipe.header.public_id);

              if (!first) {
                first = recipe.header.public_id;
              }

              var publicId = (recipe.header.public_id) ? recipe.header.public_id : defaults.header.defaultId;
              transformation.push({
                overlay: publicId,
                width: width,
                height: height,
                x: width * index,
                crop: "fill"
              });

              index++;
            }

            callback(err);
          });
        },
        function(err) {
          if (!err) {
            console.log('TRANSFORMATION', transformation);

            me.media.collage = cloudinary.image(first, {
              transformation: transformation
            });
          }

          next(err);
        });

    }
    else {

      keystone.list('Recipe').model.findOne({
        _id: this.plates[0]
      }).exec(function(err, recipe) {
        if (!err && recipe) {
          me.media.collage = recipe.thumb;
        }

        next(err);
      });

      console.log('PLATE', this.plates[0].thumb);
      me.media.collage = this.plates[0].thumb;

      next();
    }
  }
  else {
    next();
  }

});

/**
 * Registration
 * ============
 */
Menu.defaultColumns = 'title, author, state, publishedDate';
Menu.schema.plugin(mongoosastic, {
  host: config.elasticsearch.host,
  port: config.elasticsearch.port,
  log: config.elasticsearch.log
});
Menu.register();
