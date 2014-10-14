var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require(__base + 'services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var type = locals.type = (req.params.type === 'videoreceta' ? 'videorecipe' : 'recipe');
  locals.data = {};

  locals.categories = {};

  // Init locals
  if (req.params.recipe) {
    locals.section = type;
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
    recipe: req.params.recipe || null,
    contest: req.params.contest || null
  };

  var options = {
    slug: locals.filters.recipe,
    user: req.user,
    states: ['published', 'draft', 'review'],
    fromContest: true
  };

  // load recipe
  view.on('init', function(next) {

    async.series([
      // Get categories
      function(callback) {
        service.config.categories.get(function(err, results) {
          locals.categories.plates = results.categories.categories_plates;
          locals.categories.food = results.categories.categories_food;
          callback(err);
        });
      }
    ], function(err) {
      if (!err) {
        if (!locals.isNew) {
          service.recipe[type].get(options, function(err, result) {
            if (!err && result) {
              locals.data = result;
              locals.own = result.own;
              locals.title = result.recipe.title + ' - ' + (type === 'recipe' ? res.__('Recipe') : res.__('Videorecipe'));
              service.recipeList.related({
                recipeId: result.recipe._id
              }, function(err, results) {
                locals.related = results;
                next(err);
              });
            }
            else {
              return res.notfound(res.__('Not found'));
            }
          });
        }
        else {
          service.recipe.get.new({
            contest: locals.filters.contest
          }, function(err, result) {
            if (!err && result) {
              locals.data = result;
              next(null);
            }
            else {
              return res.notfound(res.__('Not found'));
            }
          });
        }
      }
      else {
        next(err);
      }

    });

  });

  // Render the view
  view.render(type);
};
