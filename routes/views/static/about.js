var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'about';
  locals.title = res.__('About');

  // Render the view
  view.render('static/about');

};
