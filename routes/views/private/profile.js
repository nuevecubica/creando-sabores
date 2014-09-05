var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var signinPage = '/acceso';

  if (!req.user) {
    return res.redirect(signinPage);
  }

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.section = 'privateProfile';
  locals.editable = true;
  locals.manageable = false;
  locals.own = true;

  // Render the view
  view.render('private/profile');
};
