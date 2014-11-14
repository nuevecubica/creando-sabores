var keystone = require('keystone'),
  User = keystone.list('User'),
  formResponse = require(__base + 'utils/formResponse.js');

var _logger = require(__base + 'utils/logger');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Init locals
  locals.section = 'forgotten-password';
  locals.email = req.body.email || '';

  view.on('post', {
    action: 'forgotten-password'
  }, function(next) {

    if (!req.body.email) {
      return formResponse(req, res, next, "Please enter an email address.", false);
    }

    User.model.findOne().where('email', req.body.email).exec(function(err, user) {
      if (err) {
        logger.error('Error looking for email to reset password: %j', err, _logger.getRequest(req));
        return next(err);
      }
      if (!user) {
        return formResponse(req, res, next, "Sorry, we don't recognise that email address.", false);
      }
      user.resetPassword(function(err) {
        if (err) {
          logger.error('Error sending reset password email: %j', err, _logger.getRequest(req));
          return formResponse(req, res, next, 'Error sending reset password email.', false);
        }
        else {
          return formResponse(req, res, '/acceso', false, 'We have emailed you a link to reset your password');
        }
      });
    });

  });

  // Render the view
  view.render('session/forgottenPassword');
};
