var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js'),
  valid = require('../../../utils/validateText.js');

exports = module.exports = function(req, res, next) {

  var back = '..',
    answer = {
      error: false,
      success: false
    };

  if (req.method === 'POST') {

    async.series([

        function(next) {
          if (req.body.username) {
            req.body.username = clean(String(req.body.username), ['username', ['maxlength', 20]]);
            if (req.body.username === req.user.username) {
              req.body.username = null;
              delete req.body.username;
            }
          }
          next();
        },
        function(next) {
          if (req.body.email) {
            req.body.email = String(req.body.email);
            if (!valid(req.body.email, ['email'])) {
              console.log('profileChange: Error saving profile, invalid email');
              return next(res.__('Error: Email format'));
            }
            return next(false);
          }
          return next(true);
        },
        function(next) {
          req.body.isPrivate = (req.body.isPrivate && req.body.isPrivate === 'on');
          return next();
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
                return next(res.__('Error: Password not match'));
              }
            });
          }
          return next();
        },
        function(next) {
          var handler = req.user.getUpdateHandler(req);
          handler.process(req.body, {
            fields: 'username,password,email,isPrivate'
          }, function(err) {
            // Error ocurred
            if (err) {
              console.log('profileChange: Error processing profile', err);
              return next(res.__('Error saving profile'));
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
          if ("string" === typeof err) {
            answer.error = true;
            req.flash('error', err);
          }
          else {
            answer.error = err;
            req.flash('error', res.__('Error saving profile'));
          }
        }
        else {
          answer.success = true;
          req.flash('success', res.__('Profile saved'));
        }
        res.set('Api-Response-Error', answer.error);
        res.set('Api-Response-Success', answer.success);
        return res.redirect(back);
      });
  }
};
