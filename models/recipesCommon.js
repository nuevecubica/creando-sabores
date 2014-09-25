<<<<<<< HEAD
..
=======
var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality');

var defaults = function() {

  var positions = [];
  for (var i = 0; i < 10; i++) {
    positions.push({
      value: i,
      label: 'Position ' + (i + 1)
    });
  }

  return {
    images: {
      header: '/images/default_recipe.jpg'
    },
    positions: positions
  };
};

var info = function() {
  return {
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
  };
};

var media = function() {
  return {
    header: {
      type: Types.CloudinaryImage,
      note: 'Minimum resolution: 1280 x 800'
    }
  };
};

var status = function() {
  return {
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
  };
};

var contest = function() {
  return {
    contest: {
      id: {
        type: Types.Relationship,
        ref: 'Contest',
        index: true
      },

      isJuryWinner: {
        type: Boolean,
        default: false
      },

      isCommunityWinner: {
        type: Boolean,
        default: false
      }
    }
  };
};

var procedure = function() {
  return {
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
  };
};

var promoted = function() {
  return {
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
        options: defaults().positions,
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
        options: defaults().positions,
        label: 'Index Grid Position',
        dependsOn: {
          'isRecipesGridPromoted.value': true
        },
        default: 0
      }
    }
  };
};

var toJSON = function() {
  return {
    virtuals: true,
    transform: modelCleaner.transformer
  };
};

var rating = function() {
  if (this.scoreCount === undefined || this.scoreCount === 0) {
    return 0;
  }
  return (this.scoreTotal / this.scoreCount);
};

var shown = function() {
  return (this.state !== 'banned' && this.state !== 'removed');
};

var thumbs = function() {
  return {
    'list': this._.header.src({
      transformation: 'list_thumb'
    }) || defaults().images.header,
    'grid_small': this._.header.src({
      transformation: 'grid_small_thumb'
    }) || defaults().images.header,
    'grid_medium': this._.header.src({
      transformation: 'grid_medium_thumb'
    }) || defaults().images.header,
    'grid_large': this._.header.src({
      transformation: 'grid_large_thumb'
    }) || defaults().images.header,
    'header': this._.header.src({
      transformation: 'header_limit_thumb'
    }) || defaults().images.header,
    'shopping_list': this._.header.src({
      transformation: 'shopping_list_thumb'
    }) || defaults().images.header,
    'hasQuality': imageQuality(this.header).hasQuality
  };
};

var classes = function() {
  var classes = ['recipe'];
  classes.push('state-' + this.state);

  if (this.contest && this.contest.id) {
    classes.push('contest-recipe');

    if (this.contest.isJuryWinner) {
      classes.push('contest-winner-jury');
    }

    if (this.contest.isCommunityWinner) {
      classes.push('contest-winner-community');
    }

  }
  // return classes;
  return classes.join(' ');
};

var valueChecker = function() {
  return function(value) {
    return (value < 0) ? value * (-1) : value;
  };
};


module.exports = {
  defaults: defaults,
  info: info,
  media: media,
  status: status,
  contest: contest,
  procedure: procedure,
  promoted: promoted,
  toJSON: toJSON,
  rating: rating,
  shown: shown,
  thumbs: thumbs,
  classes: classes,
  valueChecker: valueChecker
};
>>>>>>> Videorecipes/Services: Servicios versión inicial, modelo con correcciones, grid principal funcionando.
