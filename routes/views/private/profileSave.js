var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js');

exports = module.exports = function(req, res, next) {

  var back = '/perfil';

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
        console.log('profileSave: Error saving profile');
        req.flash('error', res.__('Error saving profile'));
        return res.redirect(back);
      }
      else {
        // New avatar uploaded? Change avatar
        if (req.files['avatars.local_upload'] && req.files['avatars.local_upload'].name !== '') {
          handler.process({
            'media.avatar.origin': 'local'
          }, {
            fields: 'media.avatar.origin'
          }, function(err) {
            // Error ocurred
            if (err) {
              console.log('profielSave: Error saving avatar');
              req.flash('error', res.__('Error saving profile'));
            }
            else {
              req.flash('success', res.__('Profile saved'));
            }
            return res.redirect(back);
          });
        }
        // Same avatar found
        else {
          req.flash('success', res.__('Profile saved'));
          return res.redirect(back);
        }
      }
    });
  }
  else {
    return res.redirect(back);
  }
};
