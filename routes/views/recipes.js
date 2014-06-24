var keystone = require('keystone'),
  async = require('async');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'recipes';
  locals.data = {
    recipes: []
  };
  locals.title = res.__('Recipes');

  // load recipes
  view.on('init', function(next) {

    var q = keystone.list('Recipe').paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('state', 1)
      .where('isBanned', false)
      .sort('-publishedDate');

    q.exec(function(err, results) {
      locals.data.recipes = results;
      next(err);
    });

  });

  // Render the view
  view.render('recipes');
};
