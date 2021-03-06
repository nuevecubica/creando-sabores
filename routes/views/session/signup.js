var keystone = require('keystone'),
  async = require('async'),
  clean = require(__base + 'utils/cleanText.js'),
  service = require(__base + 'services'),
  formResponse = require(__base + 'utils/formResponse.js'),
  config = require(__base + 'configs/editor');

exports = module.exports = function(req, res) {

  var backOk = '/';
  var backFail = '/';

  var locals = res.locals,
    view = new keystone.View(req, res);

  locals.next = null;

  if (req.query.next) {
    locals.next = req.query.next;
    req.query.next = decodeURIComponent(req.query.next || '');
    if (req.query.next.indexOf('//:') === -1 && req.query.next[0] === '/') {
      backOk = req.query.next;
    }
    else {
      locals.next = null;
    }
  }

  if (req.user) {
    return res.redirect(backOk);
  }

  // Set locals
  locals.section = 'session';
  locals.form = req.body;
  locals.errors = {
    fields: {
      name: false,
      email: false,
      password: false
    }
  };
  locals.footerType = 'mini';
  locals.hideMenu = true;
  locals.hideSocial = true;

  if (req.body.username) {
    req.body.username = clean(String(req.body.username), ['lowercase', 'username', ['maxlength', config.profile.username.length]]);
  }

  view.on('post', {
    action: 'signup'
  }, function(next) {
    async.series([
      // Check automatic login or duplicated email.
      function(cb) {
        // Mail and password
        if (req.body.signup_email && req.body.signup_password) {
          // User exists
          keystone.list('User').model.findOne({
            email: req.body.signup_email
          }, function(err, user) {
            if (user) {

              // If user is banned, signout
              if (user.isBanned) {
                keystone.session.signout(req, res, function() {
                  return formResponse(req, res, backFail, 'Access disallowed', false);
                });
              }

              // Try to signin
              var onSuccess = function() {
                // Logged in
                return res.redirect(backOk);
              };
              var onFail = function(e) {
                // Duplicated
                if (req.body.signup_name) {
                  locals.errors.fields.email = res.__('User already exists with that email address');
                  return cb(true);
                }
                return cb(false);
              };
              keystone.session.signin({
                email: req.body.signup_email,
                password: req.body.signup_password
              }, req, res, onSuccess, onFail);

            }
            else {
              // User doesn't exist
              return cb(false);
            }
          });
        }
        else {
          // Missing data
          locals.errors.form = res.__('Missing data');
          locals.errors.fields.name = !req.body.signup_name ? res.__('Required') : false;
          locals.errors.fields.email = !req.body.signup_email ? res.__('Required') : false;
          locals.errors.fields.password = !req.body.signup_password ? res.__('Required') : false;

          return cb(true);
        }
      },

      // Check missing data
      function(cb) {
        if (!req.body.signup_name ||
          !req.body.signup_email ||
          !req.body.signup_password
        ) {
          locals.errors.form = res.__('Missing data');
          locals.errors.fields.name = !req.body.signup_name ? res.__('Required') : false;
          locals.errors.fields.email = !req.body.signup_email ? res.__('Required') : false;
          locals.errors.fields.password = !req.body.signup_password ? res.__('Required') : false;

          return cb(true);
        }
        return cb(false);
      },

      // Check duplicated username.
      function(cb) {
        keystone.list('User').model.findOne({
          username: req.body.signup_name
        }, function(err, user) {
          if (err || user) {
            locals.errors.fields.name = res.__('User already exists with that username');
            return cb(true);
          }
          else {
            // User doesn't exist
            return cb(false);
          }
        });
      },

      // Check bad email.
      function(cb) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(req.body.signup_email)) {
          locals.errors.fields.email = res.__('Error: Email format');
          return cb(true);
        }
        return cb(false);
      },

      // Save to database
      function(cb) {
        var userData = {
          name: req.body.signup_name,
          username: req.body.signup_name,
          email: req.body.signup_email,
          password: req.body.signup_password
        };

        var User = keystone.list('User').model,
          newUser = new User(userData);

        newUser.save(function(err) {
          if (!err) {
            newUser.verifyEmail(cb);
          }
          else {
            return cb(err);
          }
        });
      }
    ], function(err) {
      if (err) {
        return next();
      }

      // Login on signup success
      var onSuccess = function() {
        return formResponse(req, res, backOk, false, 'Registered successfully. Please, check your email and follow the instructions in your email.');
      };
      var onFail = function(e) {
        logger.error('SIGNIN: Fail after register');
        return formResponse(req, res, backFail, 'Error signing in. Check your email for further instructions.', false);
      };
      keystone.session.signin({
        email: req.body.signup_email,
        password: req.body.signup_password
      }, req, res, onSuccess, onFail);
    });
  });

  view.on('post', {
    action: 'login'
  }, function(next) {
    // Mail and password
    if (req.body.login_email && req.body.login_password) {

      // Try to signin
      var onSuccess = function(user) {
        // If user is banned, signout
        if (user.isBanned) {
          keystone.session.signout(req, res, function() {
            return formResponse(req, res, backFail, 'Access disallowed', false);
          });
        }
        else {
          return res.redirect(backOk);
        }
      };
      var onFail = function(e) {
        // Duplicated
        logger.log('LOGIN: Login failed');

        keystone.list('User').model.findOne({
          email: req.body.login_email
        }, function(err, user) {
          if (user && !user.password) {
            var methods = [];
            if (user.social.facebook.isConfigured) {
              methods.push('Facebook');
            }
            if (user.social.google.isConfigured) {
              methods.push('Google');
            }
            if (methods.length === 0) {
              methods.push(res.__('Unknown social site'));
            }

            locals.errors.fields.password = res.__('Password is not available {{social}}', {
              'social': methods.join(res.__(' o '))
            });
          }
          else {
            locals.errors.fields.email = res.__('Invalid credentials');
            locals.errors.fields.password = res.__('Invalid credentials');
          }

          locals.errors.form = res.__('Invalid credentials');

          return next();
        });
      };
      keystone.session.signin({
        email: req.body.login_email,
        password: req.body.login_password
      }, req, res, onSuccess, onFail);
    }
    else {
      // Missing data
      logger.log('LOGIN: Invalid data');

      locals.errors.form = res.__('Invalid credentials');
      locals.errors.fields.email = !req.body.login_email ? res.__('Invalid credentials') : false;
      locals.errors.fields.password = !req.body.login_password ? res.__('Invalid credentials') : false;

      return next();
    }
  });

  // Render the view
  if (req.params.mode === 'acceso') {
    locals.title = res.__('Login');
    view.render('session/login');
  }
  else {
    locals.title = res.__('Register');
    view.render('session/signup');
  }
};
