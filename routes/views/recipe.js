var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  service = require('../../services');

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
    recipe: req.params.recipe || null,
    contest: req.params.contest || null
  };

  // load recipe
  view.on('init', function(next) {

    if (!locals.isNew) {
      service.recipe.read({
        recipe: locals.filters.recipe
      }, function(err, result) {
        if (!err && result) {
          locals.data = result;
          locals.title = result.recipe.title + ' - ' + res.__('Recipe');
          console.log('no error no new');
          next(null);
        }
        else {
          console.log('error no new', err);
          return res.notfound(res.__('Not found'));
        }
      });
    }
    else {
      service.recipe.create({
        contest: locals.filters.contest
      }, function(err, result) {
        if (!err && result) {
          locals.data = result;
          console.log('no error new');
          next(null);
        }
        else {
          console.log('error new', err);
          return res.notfound(res.__('Not found'));
        }
      });
    }
  });

  // Render the view
  view.render('recipe');
};
