var _ = require('underscore'),
  config = require(__base + 'config.js'),
  keystone = require('keystone'),
  mongoosastic = require('mongoosastic'),
  virtual = require('./virtuals'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require(__base + 'utils/modelCleaner'),
  entities = require("entities");

// ===== Defaults
// Define recipe defaults
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
 * Recipe
 * ======
 */

var Recipe = new keystone.List('Recipe', {
  map: {
    name: 'title'
  },
  autokey: {
    path: 'slug',
    from: 'title',
    unique: true,
    fixed: true,
    link: function() {
      if (this.isVideorecipe) {
        return '/videoreceta/' + this.slug;
      }
      return '/receta/' + this.slug;
    }
  }
});

Recipe.add({
    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true,
      note: 'Should be less than 12 chars to be promoted',
      es_boost: 5,
      es_indexed: true
    },

    // Needed for Mongoosastic
    slug: {
      type: Types.Text,
      es_type: "string",
      hidden: true,
      es_indexed: true
    },

    author: {
      type: Types.Relationship,
      ref: 'User',
      initial: true,
      required: true,
      index: true,
      es_type: "objectid"
    },

    isOfficial: {
      type: Types.Boolean,
      hidden: true,
      default: false,
      es_type: "boolean"
    },

    likes: {
      type: Types.Number,
      default: 0,
      es_type: "integer",
      es_indexed: true
    },

    rating: {
      type: Types.Number,
      default: 0,
      noedit: true,
      es_type: "integer",
      es_indexed: true
    },

    scoreTotal: {
      type: Types.Number,
      noedit: true,
      default: 0,
      es_type: "integer",
      es_indexed: true
    },

    scoreCount: {
      type: Types.Number,
      noedit: true,
      default: 0,
      es_type: "integer",
      es_indexed: true
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.RECIPES_SCHEMA_VERSION
    },

    suggest: {
      type: Types.Text,
      noedit: true,
      es_type: "completion",
      es_cast: function(val) {
        return this.title;
      },
      es_indexed: true
    }
  },

  'Video', {
    isVideorecipe: {
      type: Types.Boolean,
      label: 'Is a videorecipe',
      default: false,
      es_type: "boolean",
      es_indexed: true
    },
    videoUrl: {
      type: Types.Url,
      label: 'Youtube Url',
      note: 'Copy & paste youtube video url',
      dependsOn: {
        'isVideorecipe': true
      },
      default: '',
      es_type: "string"
    }
  },

  'Media', {
    header: {
      type: Types.CloudinaryImage,
      note: 'Minimum resolution: 1280 x 800',
      es_indexed: true
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'published', 'review', 'removed', 'banned'],
      default: 'draft',
      es_type: "string",
      es_indexed: true
    },

    publishedDate: {
      type: Types.Date,
      dependsOn: {
        state: 'published'
      },
      es_type: "date",
      es_boost: 4,
      es_indexed: true
    },

    editDate: {
      type: Types.Date,
      dependsOn: {
        state: 'published'
      },
      es_type: "date",
      es_boost: 3,
      es_indexed: true
    }
  },

  'Procedure', {
    difficulty: {
      type: Types.Select,
      numeric: true,
      options: [{
        value: 1,
        label: 'Muy Bajo'
      }, {
        value: 2,
        label: 'Bajo'
      }, {
        value: 3,
        label: 'Medio'
      }, {
        value: 4,
        label: 'Alto'
      }, {
        value: 5,
        label: 'Muy Alto'
      }],
      default: 0,
      es_type: "string",
      es_indexed: true
    },

    time: {
      type: Types.Number,
      note: 'In minutes',
      initial: false,
      default: 0,
      es_type: "integer",
      es_indexed: true
    },

    portions: {
      type: Types.Number,
      initial: false,
      default: 0,
      es_type: "integer",
      es_indexed: true
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
      height: 100,
      default: '',
      es_boost: 4,
      es_type: "string",
      es_indexed: true
    },

    ingredients: {
      type: Types.Html,
      wysiwyg: true,
      height: 50,
      default: '',
      es_boost: 2,
      es_type: "string",
      es_indexed: true
    },

    procedure: {
      type: Types.Html,
      wysiwyg: true,
      height: 200,
      default: '',
      es_boost: 1,
      es_type: "string",
      es_indexed: true
    }
  },

  'Contest', {
    contest: {
      id: {
        type: Types.Relationship,
        ref: 'Contest',
        index: true,
        es_type: "objectid"
      },

      isJuryWinner: {
        type: Types.Boolean,
        // hidden: true,
        default: false,
        es_type: "boolean"
      },

      isCommunityWinner: {
        type: Types.Boolean,
        // hidden: true,
        default: false,
        es_type: "boolean"
      }
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

    isRecipesHeaderPromoted: {
      type: Types.Boolean,
      label: 'Recipes header promoted',
      default: false,
      es_type: "boolean"
    },

    isRecipesGridPromoted: {
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
        label: 'Index Grid Position',
        dependsOn: {
          'isRecipesGridPromoted.value': true
        },
        default: 0,
        es_type: "integer"
      }
    }
  });

// Schema for categories
Recipe.schema.add({
  categories: {
    type: [String],
    es_indexed: true
  }
});

Recipe.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Virtuals
// Recipe.schema.virtual('rating').get(virtual.recipe.rating);
Recipe.schema.virtual('url').get(virtual.recipe.url);
Recipe.schema.virtual('type').get(virtual.recipe.type);
Recipe.schema.virtual('thumb').get(virtual.recipe.thumb);
Recipe.schema.virtual('classes').get(virtual.recipe.classes);

// Check if time and portions values
Recipe.schema.path('time').set(function(value) {
  return (value < 0) ? value * (-1) : value;
});

Recipe.schema.path('portions').set(function(value) {
  return (value < 0) ? value * (-1) : value;
});

Recipe.schema.path('videoUrl').set(function(url) {
  var ytUrl = null;

  if (url) {
    var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
    var isEmbed = (url.indexOf('iframe') < 0) ? false : true;

    var parsed = isEmbed ? url.split(' ')[3].replace(/["']/g, '').split('/') : parse_url.exec(url);

    if (parsed) {
      var id = null;
      var host = isEmbed ? parsed[2] : parsed[3];

      switch (host) {
        case 'youtu.be':
          id = parsed[5];
          break;
        case 'youtube.com':
        case 'www.youtube.com':
          id = isEmbed ? parsed[4] : parsed[6].split('=')[1];
          break;
        default:
          id = false;
          break;
      }

      ytUrl = 'https://www.youtube.com/watch?v=' + id;
    }
  }

  return ytUrl;
});

// Pre Save HOOK
Recipe.schema.pre('save', function(next) {

  var me = this;

  // Set isPromoted if recipes is promoted in grids or headers
  if (me.isIndexGridPromoted.value || me.isRecipesGridPromoted.value || me.isIndexHeaderPromoted.value || me.isRecipesHeaderPromoted.value) {
    me.isPromoted = true;
  }

  if (me.isModified('scoreTotal') || me.isModified('scoreCount')) {
    me.rating = (me.scoreTotal !== undefined || me.scoreCount > 0) ? (me.scoreTotal / me.scoreCount) : 0;
  }

  if (me.isModified('state') && me.state === 'published') {
    me.publishedDate = new Date();
  }

  if (me.ingredients) {
    var ingredients = _.compact(me.ingredients.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
    ingredients = ingredients.map(function(a) {
      // Don't allow HTML in ingredients, and clean entities
      a = a.replace(/(<([^>]+)>)/ig, "");
      a = entities.decodeHTML(a);
      a = a.replace(/</ig, "&lt;").replace(/>/ig, "&gt;");
      return a;
    });
    me.ingredients = '<p>' + ingredients.join('</p><p>') + '</p>';
  }

  async.parallel({
      // Check if user isChef, for official recipe.
      official: function(callback) {
        keystone.list('User').model.findById(me.author).exec(function(err, user) {
          if (!err && user) {
            callback(null, (user.isChef) ? user.isChef : false);
          }
          else {
            callback(null, false);
          }
        });
      },
      // Check if states recipe has changed
      state: function(callback) {
          if (me.isModified('state') && me.state !== 'publish') {

            // if recipe has been winner, then have to change contest
            if (me.contest.isJuryWinner || me.contest.isCommunityWinner) {

              // Search contest in wich is joined for change contest winner
              keystone.list('Contest').model.findOne({
                _id: me.contest.id
              }).exec(function(err, contest) {
                if (!err && contest) {

                  // if this recipe is jury winner, then have to change contest
                  // state to close because recipe winner is not right state
                  if (me.contest.isJuryWinner) {
                    contest.awards.jury.winner = null;
                    contest.state = 'closed';
                  }

                  // if this recipe is community winner, contest will search
                  // another community winner
                  if (me.contest.isCommunityWinner) {
                    contest.awards.community.winner = null;
                  }

                  // This will fire contest save pre hook, then is recipe state has
                  // changed, contest will be updated (change community winner
                  //if necessary or change contest status to closed if jury award
                  //recipe has changed its state)
                  contest.save(function(err) {
                    callback(err);
                  });

                }
                else {
                  callback(err, null);
                }
              });
            }
            else {
              callback();
            }
          }
          else {
            callback();
          }
        }
        // Adds some check and test here
    },
    function(err, results) {
      if (!err) {
        me.isOfficial = results.official;

        next();
      }
      else {
        next(err);
      }
    });
});

/**
 * Registration
 * ============
 */
Recipe.defaultColumns = 'title, author, publishedDate, isOfficial, isPromoted';
Recipe.schema.plugin(mongoosastic, {
  host: config.elasticsearch.host,
  port: config.elasticsearch.port,
  log: config.elasticsearch.log
});
Recipe.register();

Recipe.model.createMapping(function(err, mapping) {
  if (err) {
    logger.error('Error creando mapping: ', err);
  }
});
