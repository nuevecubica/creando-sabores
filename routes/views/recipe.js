var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require('../../services');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var type = locals.type = (req.params.type || 'recipe');
  locals.data = {};

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

  // load recipe
  view.on('init', function(next) {

    if (!locals.isNew) {
      service.recipe[type].get({
        recipe: locals.filters.recipe,
        user: req.user
      }, function(err, result) {
        if (!err && result) {
          locals.data = result;
          locals.own = result.own;
          locals.title = result.recipe.title + ' - ' + (type === 'recipe' ? res.__('Recipe') : res.__('Videorecipe'));
          next(null);
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
  });

  // Render the view
  view.render(type);
};
