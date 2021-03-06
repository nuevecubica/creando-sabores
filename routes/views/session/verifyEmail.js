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
      logger.error("verifyEmailToken error: %j", err, req);
      return formResponse(req, res, '/', "Error: Unknown error", false);
    }
    else if (!user) {
      logger.info("verifyEmailToken.unknown", req);
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
          logger.error("verifyEmail.save error: %j", err, req);
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
