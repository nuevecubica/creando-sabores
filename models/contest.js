var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async');

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
      label: 'Image for recipe in contest'
    },

    imageWinners: {
      type: Types.CloudinaryImage,
      label: 'Image for recipe in contest',
      dependsOn: {
        state: 'closed'
      }
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'open', 'closed', 'finished'],
      label: 'Contest state',
      default: 'draft'
    },

    openDate: {
      type: Types.Datetime,
      noedit: true,
      dependsOn: {
        state: 'open'
      },
      label: 'Start date'
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

          console.log('10', oldRecipeId);

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

                console.log('11');
                console.log(oldRecipe);
                oldRecipe.save(function(err) {
                  if (err) {}
                  console.log('12');
                  next(err, null);
                });
              }
              else {
                console.log('-101', err);
                next(err, null);
              }
            });
          }
          else {
            next();
          }
        }
        else {
          console.log('-102', err);
          next(err, null);
        }
      });
    },
    // Change true newRecipe winner
    function(next) {
      var newRecipeId = (field === 'jury') ? me.awards.jury.winner : me.awards.community.winner;

      console.log('20', newRecipeId);
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

            console.log('21');
            console.log(newRecipe);
            newRecipe.save(function(err) {
              console.log('22');
              if (err) {}
              next(err, null);
            });
          }
          else {
            console.log('-20');
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
var getNewCommunityWinner = function(callback, filterId) {

  var me = this;

  var find = {
    'contest.id': me._id,
    'contest.state': 'admited',
    'isBanned': false,
    'state': 1
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
      if (!err && winner) {

        me.awards.community.winner = winner._id;
        callback();
      }
      else {
        callback(err);
      }
    });
};

var checkStates = function(callback) {
  console.log('2');
  var me = this;

  console.log('3');

  if (me.isModified('state')) {
    console.log('4');

    if (me.state === 'draft' || me.state === 'open') {
      // If state backs to open/draft from closed
      me.awards.jury.winner = null;
      me.awards.community.winner = null;

      if (me.state === 'open') {
        // if contest state change to open, fill openDate
        me.openDate = Date.now;
      }

      callback();
    }
    else if (me.state === 'closed') {
      var that = me;
      keystone.list('Recipe').model.findOne({
        'contest.id': that._id,
        'contest.state': 'admited',
        'isBanned': false,
        'state': 1
      })
        .sort({
          rating: -1
        })
        .exec(function(err, winner) {
          if (!err && winner) {

            that.awards.community.winner = winner._id;

            callback();
          }
          else {
            callback(err);
          }
        });
    }
    else if (me.state === 'finished') {
      if (!me.imageWinners || !me.awards.jury.winner || !me.awards.community.winner) {
        me.state = 'closed';
      }

      callback();
    }
  }
  else {
    console.log('5');
    callback();
  }
};

// Check params before save
Contest.schema.pre('save', function(next) {

  // Set isPromoted if recipes is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value) {
    this.isPromoted = true;
  }

  var me = this;
  async.series([

      // Check if contest state has changed
      function(callback) {
        console.log('1');
        checkStates.call(me, function(err) {
          console.log('7');
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
        if (me.isModified('awards.community.winner')) {

          keystone.list('Contest').model.findOne({
            id: this._id,
          }).exec(function(err, contest) {

            if (!err && contest) {
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
          callback();
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
