var keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'recipe';
  locals.filters = {
    recipe: req.params.recipe
  };
  locals.data = {};

  // load recipe
  view.on('init', function(next) {

    var q = Recipe.model.findOne({
      state: 1,
      slug: locals.filters.recipe
    }).populate('author');

    q.exec(function(err, result) {
      if (!err && result) {
        locals.data.recipe = result;
        if (result) {
          locals.title = result.name + ' - ' + res.__('Recipe');
        }
      }
      else {
        return res.notfound(res.__('Not found'));
      }
      next(err);
    });
  });

  // Render the view
  view.render('recipe');
};
