var _ = require('underscore'),
  config = require(__base + 'config.js'),
  mongoosastic = require('mongoosastic'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  virtual = require('./virtuals'),
  moment = require('moment'),
  modelCleaner = require(__base + 'utils/modelCleaner'),
  imageQuality = require(__base + 'utils/imageQuality');

// ===== Defaults
// Define recipe defaults
var defaults = {
  positions: [{
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
  }]
};

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


    title: {
      type: Types.Text,
      initial: true,
      required: true,
      index: true,
      es_type: "string"
    },

    // Needed for Mongoosastic
    slug: {
      type: Types.Text,
      es_type: "string",
      hidden: true
    },

    description: {
      type: Types.Html,
      wysiwyg: true,
      es_type: "string"
    },

    sponsor: {
      type: Types.Text,
      initial: true,
      required: true,
      es_type: "string"
    },

    ingredientRequired: {
      type: Types.Text,
      require: true,
      initial: true,
      label: 'Ingredient required for a contest',
      es_type: "string"
    },

  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'programmed', 'submission', 'votes', 'closed', 'finished'],
      label: 'Contest state',
      default: 'draft',
      es_type: "string"
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      hidden: true,
      default: process.env.CONTEST_SCHEMA_VERSION
    }
  },

  'Dates', {
    programmedDate: {
      type: Types.Datetime,
      require: true,
      initial: true,
      label: 'Start date',
      es_type: "date"
    },

    submissionDeadline: {
      type: Types.Datetime,
      require: true,
      initial: true,
      label: 'Finish submissions',
      es_type: "date"
    },

    deadline: {
      type: Types.Datetime,
      require: true,
      initial: true,
      label: 'Deadline',
      es_type: "date"
    }
  },

  'Media', {
    header: {
      type: Types.CloudinaryImage,
      label: 'Image header contest',
      note: 'Minimum resolution: 1280 x 800'
    },

    imageContest: {
      type: Types.CloudinaryImage,
      label: 'Image for contest'
    },

    headerBackgroundRecipe: {
      type: Types.CloudinaryImage,
      label: 'Image for background recipe'
    }

  },

  'Awards', {
    awards: {
      jury: {
        name: {
          type: Types.Text,
          label: 'Name jury award',
          es_type: "string"
        },

        description: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description jury award',
          es_type: "string"
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          filters: {
            'contest.id': ':_id',
            'state': 'published'
          },
          label: 'Winner',
          dependsOn: {
            state: 'closed'
          },
          es_type: "objectid"
        }
      },

      community: {
        name: {
          type: Types.Text,
          label: 'Name community award',
          es_type: "string"
        },

        description: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description community award',
          es_type: "string"
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          noedit: true,
          filters: {
            'contest.id': ':_id',
            'state': 'published'
          },
          label: 'Winner',
          dependsOn: {
            state: 'closed'
          },
          es_type: "objectid"
        }
      }
    }
  },

  'Legal', {
    terms: {
      type: Types.Html,
      wysiwyg: true,
      es_type: "string"
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
    }
  });

Contest.schema.set('toJSON', {
  virtuals: true,
  transform: modelCleaner.transformer
});

Contest.schema.virtual('thumb').get(virtual.contest.thumb);
Contest.schema.virtual('url').get(virtual.contest.url);

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
    'state': 'published'
  };

  if (filterId) {
    find._id = {
      '$ne': filterId
    };
  }

  return keystone.list('Recipe').model.findOne(find)
    .sort({
      likes: -1
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
      if (me.state === 'closed' || !me.awards.jury.winner || !me.awards.community.winner) {
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
  var me = this;

  // Set isPromoted if recipes is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value) {
    this.isPromoted = true;
  }

  if (!moment(this.programmedDate).isBefore(this.submissionDeadline) || !moment(this.submissionDeadline).isBefore(this.deadline)) {
    this.state = 'draft';
  }

  if (me.state !== 'draft' && me.state !== 'closed' && me.state !== 'finished') {
    if (moment().isBefore(this.programmedDate)) {
      this.state = 'programmed';
    }
    else if (moment().isBefore(this.submissionDeadline)) {
      this.state = 'submission';
    }
    else if (moment().isBefore(this.deadline)) {
      this.state = 'votes';
    }
    else {
      this.state = 'closed';
    }
  }

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
Contest.schema.plugin(mongoosastic, {
  host: config.elasticsearch.host,
  port: config.elasticsearch.port,
  log: config.elasticsearch.log
});
Contest.register();
