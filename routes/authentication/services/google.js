var async = require('async'),
  _ = require('underscore');

var passport = require('passport'),
  passportGoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var keystone = require('keystone'),
  User = keystone.list('User');

var tools = require('../tools');

// Credentials
var credentials = {
  clientID: process.env.GOOGLE_CONSUMER_KEY,
  clientSecret: process.env.GOOGLE_CONSUMER_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
};

// Authenticate User
exports.authenticateUser = function(req, res, next, callback) {
  // Begin process
  console.log('[social.google] - Triggered authentication process');

  // Set placeholder variables to hold our data
  var data = {
    googleUser: false, // FB user
    user: false // user
  };

  // Initalise Google credentials
  var googleStrategy = new passportGoogleStrategy(credentials, function(accessToken, refreshToken, profile, done) {
    done(null, {
      accessToken: accessToken,
      profile: profile
    });
  });

  // Pass through authentication to passport
  passport.use(googleStrategy);

  // Function to process FB response and decide whether we should create or update a user
  var processGUser = function(googleUser) {

    data.googleUser = googleUser;

    console.log('[social.google] - No user signed in, attempting to match via email');

    var email = data.googleUser.profile.emails;

    if (!email.length) {
      console.log('[social.google] - No email address detected, creating new user');

      return createUser();
    }

    User.model.findOne({
      'social.google.isConfigured': true,
      'social.google.profileId': data.googleUser.profile.id
    }, function(err, user) {
      if (err || !user) {
        if (err) {
          return callback(false);
        }

        console.log('[social.google] - No matching user found via social id, attempting to match via email');

        User.model.findOne({
          'email': _.first(data.googleUser.profile.emails).value
        }, function(err, user) {
          if (err || !user) {
            if (err) {
              return callback(false);
            }

            console.log('[social.google] - No matching user found via email, creating new user');
            return createUser();
          }
          else {
            console.log('[social.google] - Matched user via email, updating user');

            data.user = user;

            return saveUser();
          }
        });
      }
      else {
        console.log('[social.google] - Matched user via email, updating user');
        data.user = user;

        return signinUser();
      }
    });
  };

  // Function to create user
  var createUser = function() {

    console.log('[social.google] - Creating user');

    // Define data
    var email = data.googleUser.profile.emails;
    var name = data.googleUser.profile.displayName;
    var id = data.googleUser.profile.id;

    // Structure data
    var userData = {
      email: email.length ? _.first(data.googleUser.profile.emails).value : null,
      username: data.googleUser.profile.username || tools.createUsername(name, id),
      name: (name) ? name : null,
      media: {
        avatar: {
          origin: 'google'
        }
      },
      avatars: {
        google: data.googleUser.profile._json.picture
      }
    };

    console.log('[social.google] - user create data:', userData);

    // Create user
    data.user = new User.model(userData);

    console.log('[social.google] - Created new instance of user');

    return saveUser();
  };

  var saveUser = function() {

    // Save the user data
    console.log('[social.google] - Saving user');

    var userData = {
      social: {
        google: {
          isConfigured: true,
          profileId: data.googleUser.profile.id,
          accessToken: data.googleUser.accessToken
        }
      }
    };

    console.log('[social.google] - user update data:', userData);

    data.user.set(userData);

    data.user.save(function(err) {

      if (err) {
        console.log(err);
        console.log("[social.google] - Error saving user");
        return callback(err);
      }
      else {
        console.log("[social.google] - Saved user");

        if (req.user) {
          return callback();
        }
        else {
          return signinUser();
        }
      }
    });
  };

  // Function to sign user
  var signinUser = function() {

    console.log('[social.google] - Signing user');

    var onSuccess = function(user) {
      console.log("[social.google] - Successfully signed");
      return callback();
    };

    var onFail = function(err) {
      console.log("[social.google] - Failed signing in");
      return callback(true);
    };

    keystone.session.signin(String(data.user._id), req, res, onSuccess, onFail);

  };

  // Google passport requires two URLs, authenticate and callback.
  // First time, in authenticate flow we call to google request access
  // if request has code params, means callback flow.
  if (_.has(req.query, 'code')) {
    console.log('[social.google] - Callback workflow detected, attempting to process data');

    passport.authenticate('google', {

    }, function(err, data, info) {

      if (err || !data) {
        console.log("[social.google] - Error retrieving Google account data - " + JSON.stringify(err));
        return callback(true);
      }

      console.log('[social.google] - Successfully retrieved Google account data, processing');

      return processGUser(data);

    })(req, res, next);
  }
  else {
    console.log('[social.google] - Authentication workflow detected, attempting to request access');

    passport.authenticate('google', {
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    })(req, res, next);
  }

};