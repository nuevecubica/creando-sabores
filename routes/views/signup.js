var keystone = require('keystone'),
  async = require('async');

exports = module.exports = function(req, res) {

  var userHome = '/';

  if (req.user) {
    return res.redirect(userHome);
  }

  var locals = res.locals,
    view = new keystone.View(req, res);

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
            if (err ||  user) {
              // Try to signin
              var onSuccess = function() {
                // Logged in
                return res.redirect(userHome);
              };
              var onFail = function(e) {
                // Duplicated
                if (req.body.signup_name) {
                  console.error('SIGNUP: Email exists');

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
          console.error('SIGNUP: Missing data');

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
          console.error('SIGNUP: Missing data');

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
            console.error('SIGNUP: Username exists');

            locals.errors.fields.name = res.__('User already exists with that username');

            return cb(true);
          }
          else {
            // User doesn't exist
            return cb(false);
          }
        });
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
            console.log('SIGNUP: User saved to database');
          }
          return cb(err);
        });
      }
    ], function(err) {
      if (err) {
        return next();
      }

      // Login on signup success
      var onSuccess = function() {
        return res.redirect(userHome);
      };
      var onFail = function(e) {
        console.error('SIGNIN: Fail after register');
        req.flash('error',
          res.__('Error signing in'));
        return next();
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
      var onSuccess = function() {
        // Logged in
        return res.redirect(userHome);
      };
      var onFail = function(e) {
        // Duplicated
        console.error('LOGIN: Login failed');

        keystone.list('User').model.findOne({
          email: req.body.login_email
        }, function(err, user) {
          if (user && !user.password) {
            locals.errors.fields.password = res.__('Password is not available');
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
      console.error('LOGIN: Invalid data');

      locals.errors.form = res.__('Invalid credentials');
      locals.errors.fields.email = !req.body.login_email ? res.__('Invalid credentials') : false;
      locals.errors.fields.password = !req.body.login_password ? res.__('Invalid credentials') : false;

      return next();
    }
  });

  // Render the view
  if (req.params.mode === 'acceso') {
    view.render('login');
  }
  else {
    view.render('signup');
  }
};
