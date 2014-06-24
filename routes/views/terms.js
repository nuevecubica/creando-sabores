var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'terms';
  locals.footerType = 'mini';
  locals.hideSocial = true;
  locals.hideMenu = true;
  locals.title = res.__('Terms and conditions');

  // Render the view
  view.render('terms');

};
