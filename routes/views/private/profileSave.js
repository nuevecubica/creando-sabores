var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js'),
  formResponse = require('../../../utils/formResponse.js');

exports = module.exports = function(req, res, next) {

  var back = '..';

  if (req.method === 'POST') {

    if ("string" === typeof req.body.name && req.body.name) {
      req.body.name = clean(req.body.name, ['plaintext', 'oneline', ['maxlength', 20], 'escape']);
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
        return formResponse(req, res, back, 'Error saving profile', false);
      }
      else {
        // New avatar uploaded? Change avatar
        if (req.files && req.files['avatars.local_upload'] && req.files['avatars.local_upload'].name !== '') {
          handler.process({
            'media.avatar.origin': 'local'
          }, {
            fields: 'media.avatar.origin'
          }, function(err) {
            // Error ocurred
            if (err) {
              console.log('profileSave: Error saving avatar');
              return formResponse(req, res, back, 'Error saving profile', false);
            }
            else {
              return formResponse(req, res, back, false, 'Profile saved');
            }
          });
        }
        // Same avatar found
        else {
          return formResponse(req, res, back, false, 'Profile saved');
        }
      }
    });
  }
  else {
    return formResponse(req, res, back, false, false);
  }
};