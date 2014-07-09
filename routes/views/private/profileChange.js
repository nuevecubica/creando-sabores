var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js'),
  valid = require('../../../utils/validateText.js');

exports = module.exports = function(req, res, next) {

  var back = '/perfil';

  if (req.method === 'POST') {

    async.series([

        function(next) {
          if ("string" === typeof req.body.username && req.body.username) {
            req.body.username = clean(req.body.username, ['username', ['maxlength', 20]]);
          }
          next();
        },
        function(next) {
          if ("string" === typeof req.body.email && req.body.email) {
            if (!valid(req.body.email, ['email'])) {
              console.log('profileChange: Error saving profile, invalid email');
              req.flash('error', res.__('Error: Email format'));
              return next(true);
            }
            return next(false);
          }
        },
        function(next) {
          if (req.body.password) {
            req.body.password = null;
          }

          if ("string" === typeof req.body['old-pass'] && req.body['old-pass'] && "string" === typeof req.body['new-pass'] && req.body['new-pass']) {
            req.user._.password.compare(req.body['old-pass'], function(err, isMatch) {
              if (!err && isMatch) {
                req.body.password = req.body['new-pass'];
                return next();
              }
              else {
                console.log('profileChange: Error saving profile, invalid password', err);
                req.flash('error', res.__('Error: Password not match'));
                return next(true);
              }
            });
          }
        },
        function(next) {
          var handler = req.user.getUpdateHandler(req);
          handler.process(req.body, {
            fields: 'username,password,email'
          }, function(err) {
            // Error ocurred
            if (err) {
              console.log('profileChange: Error processing profile', err);
              req.flash('error', res.__('Error saving profile'));
              return next(true);
            }
            else {
              return next();
            }
          });
        }
      ],
      function(err) {
        if (err) {
          console.log('profileChange: Error saving profile', err);
          req.flash('error', res.__('Error saving profile'));
        }
        else {
          req.flash('success', res.__('Profile saved'));
        }
        return res.redirect(back);
      });
  }
};
