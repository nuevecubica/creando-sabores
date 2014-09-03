var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipes');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.title = res.__('Ranking');
  locals.section = 'ranking';

  locals.data = {};

  locals.filters = {
    contest: req.params.contest
  };

  // Render the view
  view.render('ranking');
};
