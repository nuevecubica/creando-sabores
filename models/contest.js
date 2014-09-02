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
    name: 'title'
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
      index: true
    },

    ingredientRequired: {
      type: Types.Text,
      require: true,
      initial: true,
      label: 'Ingredient required for a contest'
    },

    finishedDate: {
      type: Types.Datetime,
      require: true,
      initial: true,
      label: 'Finish date'
    },
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
        state: 'finished'
      }
    }
  },

  'Status', {
    state: {
      type: Types.Select,
      options: ['draft', 'started', 'finished', 'resolved'],
      label: 'Contest state',
      default: 'draft'
    },

    startedDate: {
      type: Types.Datetime,
      noedit: true,
      dependsOn: {
        state: 'started'
      },
      label: 'Start date'
    },

    schemaVersion: {
      type: Types.Number,
      noedit: true,
      default: process.env.CONTEST_SCHEMA_VERSION
    }
  },

  'Awards', {
    awards: {
      idContest: {
        type: Types.Text,
        hidden: true
      },

      jury: {
        award: {
          type: Types.Text,
          label: 'Award for jury winner',
          dependsOn: {
            state: 'finished'
          }
        },

        juryAwardDescription: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description for jury award',
          dependsOn: {
            state: 'finished'
          }
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          noedit: true,
          many: false,
          filters: {
            'isForContest': ':idContest',
            'contest.state': 'admited'
          },
          label: 'Jury winner',
          dependsOn: {
            state: 'finished'
          }
        }
      },

      users: {
        award: {
          type: Types.Text,
          label: 'Award for users winner',
          dependsOn: {
            state: 'finished'
          }
        },

        usersAwardDescription: {
          type: Types.Html,
          wysiwyg: true,
          label: 'Description for users award',
          dependsOn: {
            state: 'finished'
          }
        },

        winner: {
          type: Types.Relationship,
          ref: 'Recipe',
          many: false,
          filters: {
            'isForContest': ':idContest',
            'contest.state': 'admited'
          },
          label: 'Users winner',
          dependsOn: {
            state: 'finished'
          }
        }
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
    }
  });

// Check params before save
Contest.schema.pre('save', function(next) {

  // Set isPromoted if recipes is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value) {
    this.isPromoted = true;
  }

  if (this.imageWinners && this.awards.jury.winner && this.awards.users.winner) {
    this.state = 'resolved';
  }

  console.log('ID:', this.id, this._id);
  this.awards.idContest = (this.id || this._id);

  next();
});

/**
 * Registration
 * ============
 */
Contest.defaultColumns = 'title, finishedDate, status';
Contest.register();
