var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js');

exports = module.exports = function(req, res, next) {

  var userPrivateProfile = '/perfil';

  if (req.method === 'POST') {

    if ("string" === typeof req.body.name && req.body.name) {
      req.body.name = clean(req.body.name, ['plaintext', 'oneline', ['maxlength', 20]]);
    }

    if ("string" === typeof req.body.about && req.body.about) {
      req.body.about = clean(req.body.about, ['escape', 'textarea', 'paragraphs']);
    }

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
            return res.redirect(userPrivateProfile);
          });
        }
        // Same avatar found
        else {
          return res.redirect(userPrivateProfile);
        }
      }
    });
  }
  else {
    return res.redirect(userPrivateProfile);
  }
};
