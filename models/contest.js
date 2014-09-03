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

// Check params before save
Contest.schema.pre('save', function(next) {

  // Set isPromoted if recipes is promoted in grids or headers
  if (this.isIndexGridPromoted.value || this.isIndexHeaderPromoted.value) {
    this.isPromoted = true;
  }

  // If state change to finished and imageWinners and jury winner is not define, revoke state change
  if (this.state === 'finished' && !this.imageWinners && !this.awards.jury.winner) {
    this.state = 'closed';
  }

  // if contest state change to open, fill openDate
  if (this.state === 'open' && !this.openDate) {
    this.openDate = Date.now;
  }

  next();
});

/**
 * Registration
 * ============
 */
Contest.defaultColumns = 'title, finishedDate|20%, state|20%';
Contest.register();
