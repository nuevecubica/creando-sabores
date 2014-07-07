var async = require('async'),
  keystone = require('keystone');

exports = module.exports = function(req, res) {

  var userPrivateProfile = '/perfil';

  var view = new keystone.View(req, res);

  view.on('post', {
    action: 'save'
  }, function(next) {
    var handler = req.user.getUpdateHandler(req);

    handler.process(req.body, {
      fields: 'name,about,avatars.local,media.avatar.origin,media.header'
    }, function(err) {
      // Error ocurred
      if (err) {
        return res.redirect(userPrivateProfile);
      }
      else {
        // New avatar uploaded? Change avatar
        if (req.body['avatars.local_upload']) {
          handler.process({
            'media.avatar.origin': 'local'
          }, {
            fields: 'media.avatar.origin'
          }, function(err) {
            // Error ocurred
            if (err) {
              req.flash('error', res.__('Error saving avatar.'));
            }
            // Update success
            else {}
            return res.redirect(userPrivateProfile);
          });
        }
        // Same avatar found
        else {
          return res.redirect(userPrivateProfile);
        }
      }
    });
  });
};
