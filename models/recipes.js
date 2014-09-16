var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require('../utils/modelCleaner');

var positions = [{
  value: 0,
  label: 'Position 1'
}, {
  value: 1,
  label: 'Position 2'
}, {
  value: 2,
  label: 'Position 3'
}, {
  value: 3,
  label: 'Position 4'
}, {
  value: 4,
  label: 'Position 5'
}, {
  value: 5,
  label: 'Position 6'
}, {
  value: 6,
  label: 'Position 7'
}, {
  value: 7,
  label: 'Position 8'
}, {
  value: 8,
  label: 'Position 9'
}, {
  value: 9,
  label: 'Position 10'
}];

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

    rating: {
      type: Types.Number

      /*
        Waiting for a new approach to votes and ratings
      */

      // noedit: true,
      // watch: true,
      // value: function() {
      //   var average = 0;

      //   if (this.review.length <= 0) {
      //     return 0.00;
      //   }

      //   for (var rev = 0; rev < this.review.length; rev++) {
      //     average += this.review[rev].rating;
      //   }

      //   return (average / this.review.length).toFixed(2);
      // }
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.RECIPES_SCHEMA_VERSION
    }
  },

  'Media', {
    header: {
      type: Types.CloudinaryImage
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      numeric: true,
      options: [{
        value: 0,
        label: 'draft'
      }, {
        value: 1,
        label: 'published'
        // }, {
        //   value: 2,
        //   label: 'removed'
        // }, {
        //   value: 3,
        //   label: 'banned'
      }],
      default: 0
    },

    publishedDate: {
      type: Types.Date,
      dependsOn: {
        state: 1
      }
    },

    editDate: {
      type: Types.Date,
      dependsOn: {
        state: 1
      }
    },

    isBanned: {
      type: Types.Boolean,
      label: 'Ban',
      note: 'This recipe contains something evil',
      dependsOn: {
        state: 1
      },
      default: false
    },

    isRemoved: {
      type: Types.Boolean,
      label: 'Removed',
      note: 'This recipe is no longer available',
      default: false
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

      state: {
        type: Types.Select,
        options: ['none', 'review', 'admited', 'rejected'],
        default: 'none',
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
        options: positions,
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
        options: positions,
        label: 'Index Grid Position',
        dependsOn: {
          'isRecipesGridPromoted.value': true
        },
        default: 0
      }
    }
  });

Recipe.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(function() {
  return (!this.isBanned && !this.isRemoved);
});

// URL
Recipe.schema.virtual('url').get(function() {
  return '/receta/' + this.slug;
});

Recipe.schema.virtual('thumb').get(function() {
  return {
    'list': this._.header.src({
      transformation: 'list_thumb'
    }),
    'grid_small': this._.header.src({
      transformation: 'grid_small_thumb'
    }),
    'grid_medium': this._.header.src({
      transformation: 'grid_medium_thumb'
    }),
    'grid_large': this._.header.src({
      transformation: 'grid_large_thumb'
    }),
    'header': this._.header.src({
      transformation: 'header_limit_thumb'
    })
  };
});

Recipe.schema.virtual('classes').get(function() {
  var classes = ['recipe'];
  if (this.isBanned) {
    classes.push('state-banned');
  }
  else if (this.isRemoved) {
    classes.push('state-removed');
  }
  else if (this.state === 1) {
    classes.push('state-published');
  }
  else if (this.state === 0) {
    classes.push('state-draft');
  }

  if (this.contest && this.contest.id) {
    classes.push('contest-recipe');
    classes.push('contest-state-' + this.contest.state);
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

// Pre Save HOOK
Recipe.schema.pre('save', function(next) {

  var me = this;

  // Set isPromoted if recipes is promoted in grids or headers
  if (me.isIndexGridPromoted.value || me.isRecipesGridPromoted.value || me.isIndexHeaderPromoted.value || me.isRecipesHeaderPromoted.value) {
    me.isPromoted = true;
  }

  // Set recipe in review for contest
  if (me.isForContest && me.contest.state === 'none') {
    me.contest.state = 'review';
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
        if (me.isModified('isBanned') && me.isBanned === true ||
          me.isModified('isRemoved') && me.isRemoved === true ||
          me.isModified('state') && me.state !== 'publish' ||
          me.isModified('contest.state') && me.contest.state !== 'admited') {

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

/*
  Waiting for a new approach to votes and ratings
*/

// Schema for ranking
// var Rating = new keystone.mongoose.Schema({
//   user: String,
//   rating: Number
// });

// Recipe.schema.add({
//   review: {
//     type: [Rating],
//     select: false
//   }
// });

/**
 * Registration
 * ============
 */
// Recipe.defaultColumns = 'title, author, publishedDate, isOfficial, isBanned, isPromoted';
Recipe.defaultColumns = 'title, author, contest.isJuryWinner, contest.isCommunityWinner, contest.state';
Recipe.register();
