var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'press';
  locals.hideSocial = true;
  locals.title = res.__('Press');

  // Render the view
  view.render('static/press');

};
