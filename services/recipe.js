var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  Contest = keystone.list('Contest'),
  service = require('./index');

var defaults = {
  rating: 0,
  time: 30,
  portions: 2,
  difficulty: 3,
  description: '',
  procedure: '',
  state: 'draft',
  isVideorecipe: false
};

/**
 * Coonverts paragraphs to lines
 * @param  {model} recipe
 * @return {model}
 */
var parseRecipe = function(recipe) {
  var data = {};
  if (recipe.ingredients) {
    var ingr = String(recipe.ingredients);
    data.ingredients = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
  }

  if (recipe.procedure) {
    var procedure = String(recipe.procedure);
    data.procedure = _.compact(procedure.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
  }
  return _.defaults(data, recipe);
};

/*
  Result example:
    data: {
      recipe: {},
      contest: {},
      own: {}
    }
 */

/**
 * Reads a recipe from the database
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {null}
 */
var getAllRecipe = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    user: null,
    slug: null,
    populate: ['author'],
    all: false,
    sort: null,
    flags: [],
    fromContests: true,
    states: ['published']
  });

  options.limit = 1; // forced

  if (options.recipe) {
    console.warn('Deprecated call on service.recipe with options:', options);
    options.slug = options.recipe;
  }

  if (options.slug) {

    service.recipeList.get(options, function(err, result) {
      if (!err && result) {

        data.recipe = _.defaults(parseRecipe(result), defaults);
        data.recipe._document = result;

        if (options.user) {
          // Am I the owner?
          data.own = (options.user._id.toString() === result.author._id.toString()) || options.user.isAdmin;
          if (data.recipe.isVideorecipe) {
            data.own = false;
          }
          // Is it on my shopping list?
          data.inShoppingList = (options.user.shopping.indexOf(result._id) !== -1);
          // Is it on my favourites list?
          data.favourited = (options.user.favourites.indexOf(result._id) !== -1);
          // Has it my like?
          data.liked = (options.user.likes.indexOf(result._id) !== -1);
        }
        else {
          data.inShoppingList = false;
          data.liked = false;
          data.favourited = false;
          data.own = false;
        }

        if (
          (['draft', 'review'].indexOf(result.state) >= 0 && !data.own) || // Drafts only for the owner
          ['removed', 'banned'].indexOf(result.state) >= 0
        ) {
          return callback(err || 'Not found', null);
        }

        // Is it a contest recipe?
        if (result.contest) {
          // Populate nested contest
          var optionsContest = {
            path: 'contest.id',
            model: 'Contest'
          };
          Contest.model.populate(result, optionsContest, function(err, result) {
            if (!err && result) {
              data.contest = result.contest.id;
              return callback(null, data);
            }
            else {
              if (err) {
                console.error('Error service.recipe.read Contest.model.populate community winner', err);
              }
              return callback(err || 'Not found', {});
            }
          });
        }
        else {
          return callback(null, data);
        }
      }
      else {
        if (err) {
          console.error('Error service.recipe.read find', err);
        }
        return callback(err || 'Not found', {});
      }
    });
  }
  else {
    return callback('Not found', data);
  }
};

/**
 * Reads a videorecipe from the database. Uses getAllRecipe internally.
 */
var getVideoRecipe = function(options, callback) {
  if (!options.flags) {
    options.flags = ['+isVideorecipe'];
  }
  else if (options.flags.indexOf('+isVideorecipe') === -1) {
    options.flags.push('+isVideorecipe');
  }
  getAllRecipe(options, callback);
};

/**
 * Reads a recipe from the database. Uses getAllRecipe internally.
 */
var getRecipe = function(options, callback) {
  if (!options.flags) {
    options.flags = ['-isVideorecipe'];
  }
  else if (options.flags.indexOf('-isVideorecipe') === -1) {
    options.flags.push('-isVideorecipe');
  }
  getAllRecipe(options, callback);
};

/**
 * Returns an empty recipe
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {null}
 */
var getRecipeNew = function(options, callback) {
  var data = {};

  options = options || {};

  if (options.contest) {
    Contest.model.findOne({
      slug: options.contest
    })
      .exec(function(err, result) {
        if (!err && result) {
          if (result.state !== 'submission') {
            return callback('Not found', null);
          }
          data.recipe = defaults;
          data.contest = result;
          return callback(err, data);
        }
        else {
          return callback(err || 'Not found', null);
        }
      });
  }
  else {
    data = {
      recipe: defaults
    };
    return callback(null, data);
  }
};

/*
  Set exportable object
 */
var _service = {
  get: getAllRecipe,
  videorecipe: {
    get: getVideoRecipe
  },
  recipe: {
    get: getRecipe
  }
};
_service.get.new = getRecipeNew;

exports = module.exports = _service;
