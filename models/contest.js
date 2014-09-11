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
 * Contest
 * ======
 */

var Contest = new keystone.List('Contest', {
  map: {
    name: 'title',
    idContest: 'id'
  },

  autokey: {
    path: 'slug',
    from: 'title',
    unique: true,
    fixed: true
  }
});

Contest.add({

    sponsor: {
      type: Types.Text,
      initial: true,
      required: true
    },

    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
    },

    ingredientRequired: {
      type: Types.Text,
      require: true,
      initial: true,
      label: 'Ingredient required for a contest'
    },

  },

  'Dates', {
    programedDate: {
      type: Types.Datetime,
      label: 'Start date'
    },

    submissionDeadline: {
      type: Types.Datetime,
      label: 'Finish submissions'
    },

    deadline: {
      type: Types.Datetime,
      require: true,
      initial: true,
      label: 'Deadline'
    }
  },

  'Media', {
    imageContest: {
      type: Types.CloudinaryImage,
      label: 'Image for contest'
    },

    headerBackgroundRecipe: {
      type: Types.CloudinaryImage,
      label: 'Image for background recipe'
    },

    imageWinners: {
      type: Types.CloudinaryImage,
      label: 'Image for finished contest',
      dependsOn: {
        state: 'closed'
      }
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'programmed', 'submission', 'votes', 'closed', 'finished'],
      label: 'Contest state',
      default: 'draft'
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      hidden: true,
      default: process.env.CONTEST_SCHEMA_VERSION
    }
  },

  'Awards', {
    awards: {
      jury: {
        name: {
          type: Types.Text,
          label: 'Name jury award'
        },

        description: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description jury award'
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          filters: {
            'isForContest': ':id',
            'contest.state': 'admited'
          },
          label: 'Winner',
          dependsOn: {
            state: 'closed'
          }
        }
      },

      community: {
        name: {
          type: Types.Text,
          label: 'Name community award'
        },

        description: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description community award'
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          noedit: true,
          filters: {
            'isForContest': ':id',
            'contest.state': 'admited'
          },
          label: 'Winner',
          dependsOn: {
            state: 'closed'
          }
        }
      }
    }
  },

  'Legal', {
    terms: {
      type: Types.Html,
      wysiwyg: true
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
    }
  });

Contest.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

Contest.schema.virtual('thumb').get(function() {
  return {
    'list': this._.imageContest.src({
      transformation: 'list_thumb'
    }),
    'grid_small': this._.imageContest.src({
      transformation: 'grid_small_thumb'
    }),
    'grid_medium': this._.imageContest.src({
      transformation: 'grid_medium_thumb'
    }),
    'grid_large': this._.imageContest.src({
      transformation: 'grid_large_thumb'
    }),
    'header': this._.headerBackgroundRecipe.src({
      transformation: 'header_thumb'
    })
  };
});

Contest.schema.virtual('url').get(function() {
  return '/concurso/' + this.slug;
});

// Function to switch recipe state
// Params:
// -- field: string with a winner field name to change it (jury or community)
// -- callback: function callback
var switcher = function(field, callback) {
  var me = this;
  return async.series([
    // First change to false isJuryWinner in current recipe.
    function(next) {
      // Get the oldRecipe winner  in database
      keystone.list('Contest').model.findById(me._id).exec(function(err, contest) {

        if (!err && contest) {
          var oldRecipeId = (field === 'jury') ? contest.awards.jury.winner : contest.awards.community.winner;

          // If oldRecipeId does not exists, means that is a "clear winner"
          if (oldRecipeId) {
            keystone.list('Recipe').model.findById(oldRecipeId).exec(function(err, oldRecipe) {

              if (!err && oldRecipe) {
                if (field === 'jury') {
                  oldRecipe.contest.isJuryWinner = false;
                }
                else if (field === 'community') {
                  oldRecipe.contest.isCommunityWinner = false;
                }

                // Save recipe
                oldRecipe.save(function(err) {
                  if (err) {}
                  next(err, null);
                });
              }
              else {
                next(err, null);
              }
            });
          }
          else {
            next();
          }
        }
        else {
          next(err, null);
        }
      });
    },
    // Change true newRecipe winner
    function(next) {
      var newRecipeId = (field === 'jury') ? me.awards.jury.winner : me.awards.community.winner;

      // If newRecipeId does not exists, means that is a "clear winner"
      if (newRecipeId) {
        keystone.list('Recipe').model.findById(newRecipeId).exec(function(err, newRecipe) {

          if (!err && newRecipe) {
            if (field === 'jury') {
              newRecipe.contest.isJuryWinner = true;
            }
            else if (field === 'community') {
              newRecipe.contest.isCommunityWinner = true;
            }

            // Save recipe
            newRecipe.save(function(err) {
              if (err) {}
              next(err, null);
            });
          }
          else {
            next(err, null);
          }
        });
      }
      else {
        next();
      }
    }
  ], function(err, result) {
    callback(err);
  });
};

// Set new community winner if current has changed its state
// - filterid: is a current community winner recipe id. this param remove current id from find result.
var getNewCommunityWinner = function(callback, filterId) {
  var me = this;
  var find = {
    'contest.id': me._id,
    'contest.state': 'admited',
    'isRemoved': false,
    'isBanned': false,
    'state': 1,
    'rating': {
      '$gt': 0
    }
  };

  if (filterId) {
    find._id = {
      '$ne': filterId
    };
  }

  return keystone.list('Recipe').model.findOne(find)
    .sort({
      rating: -1
    })
    .exec(function(err, winner) {
      if (!err) {
        if (winner) {
          me.awards.community.winner = winner._id;
        }
        else {
          // if winner is null, means that there is no more recipes with rating > 0
          me.awards.community.winner = null;
          me.state = 'closed';
        }

        callback();
      }
      else {
        callback(err);
      }
    });
};

// This function check if any state has changed
var checkState = function(callback) {

  var me = this;
  if (me.isModified('state')) {

    if (me.state === 'draft' || me.state === 'programmed' || me.state === 'submission' || me.state === 'votes') {
      // If state backs to open/draft from closed
      me.awards.jury.winner = null;
      me.awards.community.winner = null;

      callback();
    }
    else if (me.state === 'closed' || me.state === 'finished') {
      if (me.state === 'closed' || !me.imageWinners || !me.awards.jury.winner || !me.awards.community.winner) {
        me.state = 'closed';

        getNewCommunityWinner.call(me, function(err) {
          callback(err);
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
  else {
    callback();
  }
};

// Pre save HOOK
Contest.schema.pre('save', function(next) {

  // Set isPromoted if recipes is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value) {
    this.isPromoted = true;
  }

  // Set contest state to programmed if start date contest is configured
  if (this.programedDate) {
    this.state = 'programmed';
  }

  var me = this;
  async.series([
      // Check if contest state has changed
      function(callback) {
        checkState.call(me, function(err) {
          callback(err);
        });
      },
      // Check if winner jury award has changed
      function(callback) {
        if (me.isModified('awards.jury.winner')) {
          switcher.call(me, 'jury', function(err) {
            callback(err);
          });
        }
        else {
          callback();
        }
      },
      // Check if community jury award has changed
      function(callback) {
        if (me.isModified('awards.community.winner') && me.state !== 'draft' &&
          me.state !== 'programmed' && me.state !== 'submission' && me.state !== 'votes') {

          keystone.list('Contest').model.findOne({
            id: this._id,
          }).exec(function(err, contest) {

            if (!err && contest) {
              // if has changed, get new winner (rating)
              getNewCommunityWinner.call(me, function(err) {
                if (!err) {
                  switcher.call(me, 'community', function(err) {
                    callback(err);
                  });
                }
                else {
                  callback(err);
                }

              }, contest.awards.community.winner);
            }
            else {
              callback(err);
            }
          });
        }
        else {
          switcher.call(me, 'community', function(err) {
            callback(err);
          });
        }
      }
    ],
    function(err) {
      if (!err) {
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
Contest.defaultColumns = 'title, finishedDate|20%, state|20%';
Contest.register();
