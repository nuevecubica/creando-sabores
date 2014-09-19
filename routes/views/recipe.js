var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  Contest = keystone.list('Contest');

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
            locals.own = locals.own || req.user.isAdmin;
          }
          else {
            locals.own = false;
          }

          // Drafts only for the owner
          if (result.state === 0 && !locals.own) {
            return res.notfound(res.__('Not found'));
          }
          // Banned
          else if (result.isBanned) {
            return res.notfound(res.__('Not found'));
          }
          // Removed
          else if (result.isRemoved) {
            return res.notfound(res.__('Not found'));
          }

          locals.data.recipe = result;
          locals.title = result.title + ' - ' + res.__('Recipe');

          // On my shopping list?
          var inShoppingList = req.user.shopping.indexOf(result._id) !== -1;
          locals.data.inShoppingList = inShoppingList;

          // Is it a contest recipe?
          if (result.contest) {
            // Populate nested contest
            var optionsContest = {
              path: 'contest.id',
              model: 'Contest'
            };
            Contest.model.populate(result, optionsContest, function(err, result) {
              if (err) {
                console.error('Error: Contest.model.populate community winner');
                return res.notfound(res.__('Not found'));
              }
              locals.data.contest = result.contest.id;
              next(err);
            });
          }
          else {
            next(err);
          }
        }
        else {
          return res.notfound(res.__('Not found'));
        }
      });
    }
    else if (req.params.contest) {
      var q2 = Contest.model.findOne({
        slug: req.params.contest
      });

      q2.exec(function(err, result) {
        if (!err && result) {
          if (result.state !== 'submission') {
            return res.notfound(res.__('Not found'));
          }
          locals.data.recipe = locals.defaults;
          locals.data.contest = result;
          next(err);
        }
        else {
          return res.notfound(res.__('Not found'));
        }
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
