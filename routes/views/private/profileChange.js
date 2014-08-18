var async = require('async'),
  keystone = require('keystone'),
  clean = require('../../../utils/cleanText.js'),
  valid = require('../../../utils/validateText.js'),
  formResponse = require('../../../utils/formResponse.js');

exports = module.exports = function(req, res, next) {

  var back = '..',
    answer = {
      error: false,
      success: false
    };

  if (req.method === 'POST') {

    var fields = ['isPrivate'];

    async.series([
        // Same username, do not change
        function(next) {
          if (req.body.username) {
            req.body.username = clean(String(req.body.username), ['username', ['maxlength', 20]]);
            if (req.body.username === req.user.username) {
              req.body.username = null;
              delete req.body.username;
            }
            else {
              fields.push('username');
            }
          }
          next();
        },
        // Email format
        function(next) {
          if (req.body.email) {
            req.body.email = String(req.body.email);
            if (!valid(req.body.email, ['email'])) {
              console.log('profileChange: Error saving profile, invalid email');
              return next('Error: Email format');
            }
            else {
              fields.push('email');
              return next(false);
            }
          }
          else {
            return next(true);
          }
        },
        // isPrivate
        function(next) {
          req.body.isPrivate = (req.body.isPrivate && req.body.isPrivate === 'on');
          return next();
        },
        // Password changed?
        function(next) {
          req.body.password = null;
          req.body.password_confirm = null;

          if (req.body['old-pass'] && req.body['new-pass']) {
            req.user._.password.compare(String(req.body['old-pass']), function(err, isMatch) {
              if (!err && isMatch) {
                req.body['password'] = String(req.body['new-pass']);
                req.body['password_confirm'] = req.body.password;
                fields.push('password');
                return next();
              }
              else {
                console.log('profileChange: Error saving profile, invalid password', err);
                return next('Error: Password not match');
              }
            });
          }
          else {
            return next();
          }
        },
        // Change profile
        function(next) {
          // console.log('USERNAME - EMAIL: ', req.user.username, req.user.email);
          // console.log('      VS        : ', req.body.username, req.body.email);
          req.user.getUpdateHandler(req).process(req.body, {
            fields: fields.join(',')
          }, function(err, user) {
            // Error ocurred
            if (err || !user) {
              console.log('profileChange: Error processing profile', err);
              return next('Error saving profile');
            }
            else {
              if (req.body.password) {
                console.log('Password change:', req.body.password, req.user.password);
              }
              var User = keystone.list('User');
              User.model.find({
                email: user.item.email
              }).exec(function(err, results) {
                console.log(results);
              });
              // console.log('WINS        : ', user.item.username, user.item.email);
              return next();
            }
          });
        }
      ],
      function(err) {
        if (err) {
          console.log('profileChange: Error saving profile', err);
          if ("string" === typeof err) {
            answer.error = err;
          }
          else {
            answer.error = 'Error saving profile';
          }
        }
        else {
          answer.success = 'Profile saved';
        }
        return formResponse(req, res, back, answer.error, answer.success);
      });
  }
};
