var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'search';

  view.on('init', function(next) {
    next();
  });

  // Render the view
  view.render('search');
};
