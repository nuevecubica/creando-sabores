var keystone = require('keystone'),
  User = keystone.list('User');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'verify-email';
  locals.token = req.params.token || null;

  if (!req.params.token) {
    console.log("Invalid token.");
    req.flash('error', res.__("Invalid token."));
    res.redirect('/');
  }

  User.model.findOne({
    verifyEmailToken: req.params.token
  }, function(err, user) {
    if (err) {
      console.error(err);
      req.flash('error', res.__("Error: Unknown error"));
      return res.redirect('/');
    }
    else if (!user) {
      console.warn("Sorry, we can't recognise that token.");
      req.flash('error', res.__("Sorry, we can't recognise that token."));
      return res.redirect('/');
    }
    else if (!req.user) {
      req.flash('info', res.__('Please, login in order to verify your email.'));
      return res.redirect('/acceso?next=/confirma-email/' + req.params.token);
    }
    else if (req.user.username === user.username) {
      user.isVerified = true;
      user.save(function(err) {
        if (err) {
          console.error('===== ERROR verifying email =====');
          console.error(err);
          req.flash('error', res.__('Error verifying your email. Please, try again.'));
          return res.redirect('/');
        }
        else {
          req.flash('success', res.__('Email verified succesfully.'));
          return res.redirect('/');
        }
      });
    }
    else {
      req.flash('error', res.__('Please, login with the correct account in order to verify your email.'));
      return res.redirect('/');
    }
  });
};
