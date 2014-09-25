var _ = require('underscore'),
  keystone = require('keystone'),
  Types = keystone.Field.Types,
  async = require('async'),
  recipe = require('./recipesCommon'),
  modelCleaner = require('../utils/modelCleaner'),
  imageQuality = require('../utils/imageQuality');

// ===== Defaults
// Define recipe defaults
var defaults = recipe.defaults;

/**
 * Videorecipe
 * ======
 */

var Videorecipe = new keystone.List('Videorecipe', {
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

var media = _.extend(recipe.media(), {
  video: {
    type: Types.Text,
    label: 'Youtube link',
    note: 'Copy & paste youtube video link'
  }
});

Videorecipe.add(
  recipe.info(),
  'Media', media,
  'Status', recipe.status(),
  'Procedure', recipe.procedure(),
  'Promoted', recipe.promoted()
);

Videorecipe.schema.set('toJSON', recipe.toJSON);

// Score
Videorecipe.schema.virtual('rating').get(recipe.rating);

// Videorecipe can be shown
Videorecipe.schema.virtual('canBeShown').get(recipe.shown);

// URL
Videorecipe.schema.virtual('url').get(recipe.url);

// Thumbs
Videorecipe.schema.virtual('thumb').get(recipe.thumbs);

//Classes
Videorecipe.schema.virtual('classes').get(recipe.classes);

// Check if time and portions values
Videorecipe.schema.path('time').set(recipe.valueChecker());

Videorecipe.schema.path('portions').set(recipe.valueChecker());

// Pre Save HOOK
Videorecipe.schema.pre('save', function(next) {

  var me = this;

  // Set isPromoted if recipes is promoted in grids or headers
  if (me.isIndexGridPromoted.value || me.isRecipesGridPromoted.value || me.isIndexHeaderPromoted.value || me.isRecipesHeaderPromoted.value) {
    me.isPromoted = true;
  }
});

/**
 * Registration
 * ============
 */
Videorecipe.defaultColumns = 'title, author, publishedDate, isOfficial, isPromoted';
Videorecipe.register();
