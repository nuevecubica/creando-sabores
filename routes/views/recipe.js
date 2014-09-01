var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.data = {};

  // Init locals
  if (req.params.recipe) {
    locals.section = 'recipe';
    locals.isNew = false;
  }
  else {
    locals.section = 'new-recipe';
    locals.isNew = true;
    locals.own = true;
  }

  locals.editable = true;
  locals.manageable = true;

  locals.filters = {
    recipe: req.params.recipe
  };

  locals.defaults = {
    rating: 0,
    time: 30,
    portions: 2,
    difficulty: 3,
    description: '',
    procedure: '',
    state: 0
  };

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

  // load recipe
  view.on('init', function(next) {

    if (!locals.isNew) {
      var q = Recipe.model.findOne({
        slug: locals.filters.recipe
      }).populate('author');

      q.exec(function(err, result) {
        if (!err && result) {

          result = _.defaults(parseRecipe(result), locals.defaults);

          // Am I the owner?
          if (req.user) {
            locals.own = (req.user._id.toString() === result.author._id.toString());
          }
          else {
            locals.own = false;
          }

          // Drafts only for the owner
          if (result.state === 0 && !locals.own) {
            return res.notfound(res.__('Not found'));
          }

          locals.data.recipe = result;
          locals.title = result.title + ' - ' + res.__('Recipe');
        }
        else {
          return res.notfound(res.__('Not found'));
        }
        next(err);
      });
    }
    else {
      locals.data.recipe = locals.defaults;
      next(null);
    }
  });

  // Render the view
  view.render('recipe');
};
