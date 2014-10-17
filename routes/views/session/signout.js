var keystone = require('keystone');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res),
    locals = res.locals;

  locals.section = 'session';
  locals.title = res.__('Logout');

  keystone.session.signout(req, res, function() {
    res.redirect('/');
  });
};
