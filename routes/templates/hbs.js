var keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.template = req.params.template;

  // load recipe
  view.on('init', function(next) {
    next();
  });

  // Render the view
  view.render('templates/hbs/' + locals.template);
};
