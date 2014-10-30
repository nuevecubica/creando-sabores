var keystone = require('keystone'),
  User = keystone.list('User'),
  formResponse = require(__base + 'utils/formResponse.js');

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
        return formResponse(req, res, '/contrasena-olvidada', "Sorry, that reset password key isn't valid.", false);
      }
      locals.found = user;
      next();
    });
  });

  view.on('post', {
    action: 'reset-password'
  }, function(next) {

    if (!req.body.password || !req.body.password_confirm) {
      return formResponse(req, res, next, "Please enter, and confirm your new password.", false);
    }

    if (req.body.password !== req.body.password_confirm) {
      return formResponse(req, res, next, 'Please make sure both passwords match.', false);
    }

    locals.found.password = req.body.password;
    locals.found.resetPasswordToken = '';
    locals.found.save(function(err) {
      if (err) {
        console.error('Error in locals.found.save: %s', err);
        return formResponse(req, res, next, "Error: Unknown error", false);
      }
      else {
        return formResponse(req, res, '/acceso', false, 'Your password has been reset, please sign in.');
      }
    });

  });

  // Render the view
  view.render('session/resetPassword');
};
