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

  var parseRecipe = function(recipe) {
    var data = {};
    if (recipe.ingredients) {
      var ingr = recipe.ingredients;
      data.ingredients = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
    }
    return _.defaults(data, recipe);
  };

  // load recipe
  view.on('init', function(next) {

    if (!locals.isNew) {
      var q = Recipe.model.findOne({
        state: 1,
        slug: locals.filters.recipe
      }).populate('author');

      q.exec(function(err, result) {
        if (!err && result) {
          locals.data.recipe = parseRecipe(result);
          if (result) {
            locals.title = result.title + ' - ' + res.__('Recipe');

            if (req.user) {
              locals.own = (req.user._id.toString() === result.author._id.toString());
            }
            else {
              locals.own = false;
            }
          }
        }
        else {
          return res.notfound(res.__('Not found'));
        }

        next(err);
      });
    }
    else {
      next(null);
    }
  });

  // Render the view
  view.render('recipe');
};
