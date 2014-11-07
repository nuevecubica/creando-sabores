var keystone = require('keystone'),
  User = keystone.list('User'),
  formResponse = require(__base + 'utils/formResponse.js');

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
        return next(err);
      }
      if (!user) {
        return formResponse(req, res, next, "Sorry, we don't recognise that email address.", false);
      }
      user.resetPassword(function(err) {
        if (err) {
          logger.error('===== ERROR sending reset password email =====');
          logger.error(err);
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
