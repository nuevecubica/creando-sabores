var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipes');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Candidates');
  locals.section = 'candidates';

  locals.data = {};

  locals.filters = {
    contest: req.params.contest,
    section: req.params.section
  };

  // Render the view
  view.render('candidates');
};
