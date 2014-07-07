var keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User');

exports = module.exports = function(req, res) {

  var signinPage = '/acceso';

  if (!req.user) {
    return res.redirect(signinPage);
  }

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'profile';
  locals.filters = {
    user: req.params.user
  };

  // load user
  view.on('init', function(next) {

    var q = User.model.findOne({
      state: 1,
      slug: locals.filters.user
    });

    q.exec(function(err, result) {
      //locals.user = result;
      next(err);
    });
  });

  // Render the view
  view.render('profile');
};
