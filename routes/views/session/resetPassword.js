var keystone = require('keystone'),
  User = keystone.list('User');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'reset-password';
  locals.key = req.params.key;

  view.on('init', function(next) {
    User.model.findOne().where('resetPasswordToken', req.params.key).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('error', res.__("Sorry, that reset password key isn't valid."));
        return res.redirect('/contrasena-olvidada');
      }
      locals.found = user;
      next();
    });
  });

  view.on('post', {
    action: 'reset-password'
  }, function(next) {

    if (!req.body.password || !req.body.password_confirm) {
      req.flash('error', res.__("Please enter, and confirm your new password."));
      return next();
    }

    if (req.body.password !== req.body.password_confirm) {
      req.flash('error', res.__('Please make sure both passwords match.'));
      return next();
    }

    locals.found.password = req.body.password;
    locals.found.resetPasswordToken = '';
    locals.found.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', res.__('Your password has been reset, please sign in.'));
      res.redirect('/acceso');
    });

  });

  // Render the view
  view.render('session/resetPassword');
};
