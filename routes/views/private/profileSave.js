var async = require('async'),
  keystone = require('keystone');

exports = module.exports = function(req, res, next) {

  var userPrivateProfile = '/perfil';

  if (req.method === 'GET') {
    return res.redirect(userPrivateProfile);
  }

  console.log('profileSave: Post request');

  var handler = req.user.getUpdateHandler(req);

  handler.process(req.body, {
    fields: 'name,about,avatars.local,media.avatar.origin,media.header'
  }, function(err) {
    // Error ocurred
    if (err) {
      console.log('profielSave: Error saving profile');
      return res.redirect(userPrivateProfile);
    }
    else {
      // New avatar uploaded? Change avatar
      if (req.body['avatars.local_upload']) {
        console.log('profielSave: Saving avatar');
        handler.process({
          'media.avatar.origin': 'local'
        }, {
          fields: 'media.avatar.origin'
        }, function(err) {
          // Error ocurred
          if (err) {
            console.log('profielSave: Error saving avatar');
            req.flash('error', res.__('Error saving avatar.'));
          }
          // Update success
          else {
            console.log('profielSave: Avatar saved');
          }
          return res.redirect(userPrivateProfile);
        });
      }
      // Same avatar found
      else {
        console.log('profielSave: Profile saved');
        return res.redirect(userPrivateProfile);
      }
    }
  });

  next();
};
