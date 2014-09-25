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

var info = _.extend(recipe.info(), {
  likes: {
    type: Types.Number,
    default: 0
  }
});

Recipe.add(
  info,
  'Media', recipe.media('recipe'),
  'Status', recipe.status(),
  'Procedure', recipe.procedure(),
  'Contest', recipe.contest(),
  'Promoted', recipe.promoted()
);

Recipe.schema.set('toJSON', recipe.toJSON);

// Score
Recipe.schema.virtual('rating').get(recipe.rating);

// Recipe can be shown
Recipe.schema.virtual('canBeShown').get(recipe.shown);

// URL
Recipe.schema.virtual('url').get(recipe.url);

// Thumbs
Recipe.schema.virtual('thumb').get(recipe.thumbs);

//Classes
Recipe.schema.virtual('classes').get(recipe.classes);

// Check if time and portions values
Recipe.schema.path('time').set(recipe.valueChecker());

Recipe.schema.path('portions').set(recipe.valueChecker());

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
Recipe.register();
