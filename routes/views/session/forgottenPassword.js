var keystone = require('keystone'),
  User = keystone.list('User');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'reset-password';
  locals.email = req.body.email || '';

  view.on('post', {
    action: 'forgotten-password'
  }, function(next) {

    if (!req.body.email) {
      console.log("Please enter an email address.");
      req.flash('error', res.__("Please enter an email address."));
      return next();
    }

    User.model.findOne().where('email', req.body.email).exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log("Sorry, we don't recognise that email address.");
        req.flash('error', res.__("Sorry, we don't recognise that email address."));
        return next();
      }
      user.resetPassword(function(err) {
        if (err) {
          console.error('===== ERROR sending reset password email =====');
          console.error(err);
          req.flash('error', res.__('Error sending reset password email.'));
          next();
        }
        else {
          req.flash('success', res.__('We have emailed you a link to reset your password'));
          res.redirect('/acceso');
        }
      });
    });

  });

  // Render the view
  view.render('session/forgottenPassword');
};
