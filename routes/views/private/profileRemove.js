var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js');

exports = module.exports = function(req, res, next) {

  var backDone = '/',
    backError = '/perfil',
    Users = keystone.list('User');

  if (req.method === 'POST') {

    Users.model.findById(req.user._id).exec(function(err, user) {
      // Error ocurred
      if (err || !user) {
        console.error('profileRemove: Error removing profile', err, user);
        req.flash('error', res.__('Error removing profile'));
        return res.redirect(backError);
      }

      user.isDeactivated = true;
      user.save(function(err) {
        if (err)  {
          console.error('profileRemove: Error removing profile', err);
          req.flash('error', res.__('Error removing profile'));
          return res.redirect(backError);
        }

        keystone.session.signout(req, res, function() {
          req.flash('success', res.__('Profile removed'));
          return res.redirect(backDone);
        });
      });

    });
  }
  else {
    return res.redirect(backError);
  }
};
