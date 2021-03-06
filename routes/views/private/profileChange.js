var async = require('async'),
  keystone = require('keystone'),
  clean = require(__base + 'utils/cleanText.js'),
  valid = require(__base + 'utils/validateText.js'),
  formResponse = require(__base + 'utils/formResponse.js'),
  config = require(__base + 'configs/editor');

exports = module.exports = function(req, res, next) {

  var back = '..',
    answer = {
      error: false,
      success: false
    };

  if (req.method === 'POST') {

    var fields = ['isPrivate', 'receiveNewsletter'];

    async.series([
        // Same username, do not change
        function(next) {
          if (req.body.username) {
            req.body.username = clean(String(req.body.username), ['lowercase', 'username', ['maxlength', config.profile.username.length]]);
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
              logger.log('profileChange: Error saving profile, invalid email');
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
                logger.log('profileChange: Error saving profile, invalid password', err);
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
          // logger.log('USERNAME - EMAIL: ', req.user.username, req.user.email);
          // logger.log('      VS        : ', req.body.username, req.body.email);
          req.user.getUpdateHandler(req).process(req.body, {
            fields: fields.join(',')
          }, function(err, user) {
            // Error ocurred
            if (err || !user) {
              logger.log('profileChange: Error processing profile', err);
              return next('Error saving profile');
            }
            else {
              if (req.body.password) {
                logger.log('Password change:', req.body.password, req.user.password);
              }
              var User = keystone.list('User');
              User.model.find({
                email: user.item.email
              }).exec(function(err, results) {
                // logger.log(results);
              });
              // logger.log('WINS        : ', user.item.username, user.item.email);
              return next();
            }
          });
        }
      ],
      function(err) {
        if (err) {
          logger.log('profileChange: Error saving profile', err);
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
