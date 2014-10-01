var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality');

// ===== Defaults
// Define recipe defaults
var defaults = {
  images: {
    header: '/images/default_recipe.jpg'
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
    fixed: true
  }
});

Recipe.add({
    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true,
      note: 'Should be less than 12 chars to be promoted'
    },

    author: {
      type: Types.Relationship,
      ref: 'User',
      initial: true,
      index: true
    },

    isOfficial: {
      type: Types.Boolean,
      hidden: true
    },

    likes: {
      type: Types.Number,
      default: 0
    },

    scoreTotal: {
      type: Types.Number,
      noedit: true,
      default: 0
    },

    scoreCount: {
      type: Types.Number,
      noedit: true,
      default: 0
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.RECIPES_SCHEMA_VERSION
    }
  },

  'Video', {
    isVideorecipe: {
      type: Types.Boolean,
      label: 'Is a videorecipe',
      default: false
    },
    videoUrl: {
      type: Types.Url,
      label: 'Youtube Url',
      note: 'Copy & paste youtube video url',
      dependsOn: {
        'isVideorecipe': true
      },
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
      options: ['draft', 'published', 'review', 'removed', 'banned'],
      default: 'draft'
    },

    publishedDate: {
      type: Types.Date,
      dependsOn: {
        state: 'published'
      }
    },

    editDate: {
      type: Types.Date,
      dependsOn: {
        state: 'published'
      }
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
      default: 0
    },

    time: {
      type: Types.Number,
      note: 'In minutes',
      initial: false,
      default: 0
    },

    portions: {
      type: Types.Number,
      initial: false,
      default: 0
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
      height: 100
    },

    ingredients: {
      type: Types.Html,
      wysiwyg: true,
      height: 50
    },

    procedure: {
      type: Types.Html,
      wysiwyg: true,
      height: 200
    }
  },

  'Contest', {
    contest: {
      id: {
        type: Types.Relationship,
        ref: 'Contest',
        index: true
      },

      isJuryWinner: {
        type: Boolean,
        // hidden: true,
        default: false
      },

      isCommunityWinner: {
        type: Boolean,
        // hidden: true,
        default: false
      }
    }
  },

  'Promoted', {
    isPromoted: {
      type: Types.Boolean,
      label: 'Promoted',
      hidden: true,
      default: false
    },

    isIndexHeaderPromoted: {
      type: Types.Boolean,
      label: 'Index header promoted',
      default: false
    },

    isIndexGridPromoted: {
      value: {
        type: Types.Boolean,
        label: 'Index Grid',
        default: false
      },

      position: {
        type: Types.Select,
        numeric: true,
        options: defaults.positions,
        label: 'Index Grid Position',
        dependsOn: {
          'isIndexGridPromoted.value': true
        },
        default: 0
      }
    },

    isRecipesHeaderPromoted: {
      type: Types.Boolean,
      label: 'Recipes header promoted',
      default: false
    },

    isRecipesGridPromoted: {
      value: {
        type: Types.Boolean,
        label: 'Recipes Grid',
        default: false
      },

      position: {
        type: Types.Select,
        numeric: true,
        options: defaults.positions,
        label: 'Index Grid Position',
        dependsOn: {
          'isRecipesGridPromoted.value': true
        },
        default: 0
      }
    }
  });

// Schema for tags
var Tags = new keystone.mongoose.Schema({
  tag: String
});

Recipe.schema.add({
  tags: {
    type: [Tags]
  }
});

Recipe.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Score
Recipe.schema.virtual('rating').get(function() {
  if (this.scoreCount === undefined || this.scoreCount === 0) {
    return 0;
  }
  return (this.scoreTotal / this.scoreCount);
});

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(function() {
  return (this.state !== 'banned' && this.state !== 'removed');
});

// URL
Recipe.schema.virtual('url').get(function() {
  return (this.isVideorecipe) ? '/videoreceta/' + this.slug : '/receta/' + this.slug;
});

Recipe.schema.virtual('thumb').get(function() {
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
});

Recipe.schema.virtual('classes').get(function() {
  var classes = ['recipe'];
  classes.push('state-' + this.state);

  if (this.contest && this.contest.id) {
    classes.push('contest-recipe');
  }

  if (this.contest.isJuryWinner) {
    classes.push('contest-winner-jury');
  }

  if (this.contest.isCommunityWinner) {
    classes.push('contest-winner-community');
  }
  // return classes;
  return classes.join(' ');
});

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
// Recipe.defaultColumns = 'title, author, isPromoted, isIndexHeaderPromoted, isRecipesHeaderPromoted';
Recipe.register();
