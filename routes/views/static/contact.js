var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'contact';
  locals.hideSocial = true;
  locals.title = res.__('Contact');

  // Render the view
  view.render('static/contact');

};
