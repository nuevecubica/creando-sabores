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
      index: true
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
      type: Types.Number,
      noedit: true,
      watch: true,
      value: function() {
        var average = 0;

        if (this.review.length <= 0) {
          return 0.00;
        }

        for (var rev = 0; rev < this.review.length; rev++) {
          average += this.review[rev].rating;
        }

        return (average / this.review.length).toFixed(2);
      }
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

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(function() {
  return !this.isBanned;
});

// Check if time and portions values
Recipe.schema.path('time').set(function(value) {
  return (value < 0) ? value * (-1) : value;
});

Recipe.schema.path('portions').set(function(value) {
  return (value < 0) ? value * (-1) : value;
});

// Check params before save
Recipe.schema.pre('save', function(next) {

  var me = this;

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
      }

      // Adds some check and test here
    },
    function(err, results) {
      me.isOfficial = results.official;

      // Set isPromoted if recipes is promoted in grids or headers
      if (me.isIndexGridPromoted.value || me.isRecipesGridPromoted.value || me.isIndexHeaderPromoted.value || me.isRecipesHeaderPromoted.value) {
        me.isPromoted = true;
      }

      next();
    });
});

// Schema for ranking
var Rating = new keystone.mongoose.Schema({
  user: String,
  rating: Number
});

Recipe.schema.add({
  review: [Rating]
});

/**
 * Registration
 * ============
 */
Recipe.defaultColumns = 'title, author, publishedDate, isOfficial, isBanned, isPromoted';
Recipe.register();
