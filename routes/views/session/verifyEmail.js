var keystone = require('keystone'),
  User = keystone.list('User'),
  formResponse = require(__base + 'utils/formResponse.js');

exports = module.exports = function(req, res) {
  if (!req.params.token) {
    return formResponse(req, res, '/', "Invalid token.", false);
  }

  User.model.findOne({
    verifyEmailToken: req.params.token
  }, function(err, user) {
    if (err) {
      console.error("verifyEmailToken error");
      console.error(err);
      return formResponse(req, res, '/', "Error: Unknown error", false);
    }
    else if (!user) {
      return formResponse(req, res, '/', "Sorry, we can't recognise that token.", false);
    }
    else if (!req.user) {
      req.flash('info', res.__('Please, login in order to verify your email.'));
      return res.redirect('/acceso?next=/confirma-email/' + req.params.token);
    }
    else if (req.user.username === user.username && req.user.email === user.email) {
      user.isConfirmed = true;
      user.verifyEmailToken = '';
      user.save(function(err, ended) {
        if (err) {
          console.error('===== ERROR verifying email =====');
          console.error(err);
          return formResponse(req, res, '/', 'Error verifying your email. Please, try again.', false);
        }
        else {
          return formResponse(req, res, '/', false, 'Email verified succesfully.');
        }
      });
    }
    else {
      return formResponse(req, res, '/', 'Please, login with the correct account in order to verify your email.', false);
    }
  });
};
