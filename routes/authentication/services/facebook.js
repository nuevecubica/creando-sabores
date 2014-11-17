var async = require('async'),
  _ = require('underscore');

var passport = require('passport'),
  passportFacebookStrategy = require('passport-facebook').Strategy;

var keystone = require('keystone'),
  User = keystone.list('User');

var tools = require('../tools');

// Credentials
var credentials = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL
};

// Authenticate User
exports.authenticateUser = function(req, res, next, callback) {
  // Begin process
  logger.log('[social.facebook] - Triggered authentication process');

  // Set placeholder variables to hold our data
  var data = {
    facebookUser: false, // FB user
    user: false // user
  };

  // Initalise Facebook credentials
  var facebookStrategy = new passportFacebookStrategy(credentials, function(accessToken, refreshToken, profile, done) {
    done(null, {
      accessToken: accessToken,
      profile: profile
    });
  });

  // Pass through authentication to passport
  passport.use(facebookStrategy);

  // Function to process FB response and decide whether we should create or update a user
  var processFBUser = function(facebookUser) {

    data.facebookUser = facebookUser;

    logger.log('[social.facebook] - No user signed in, attempting to match via social id');

    var email = data.facebookUser.profile.emails;

    if (!email.length) {
      logger.log('[social.facebook] - No email address detected, creating new user');

      return createUser();
    }

    User.model.findOne({
      'social.facebook.isConfigured': true,
      'social.facebook.profileId': data.facebookUser.profile.id
    }, function(err, user) {
      if (err || !user) {
        if (err) {
          return callback(false);
        }

        logger.log('[social.facebook] - No matching user found via social id, attempting to match via email');

        User.model.findOne({
          'email': _.first(data.facebookUser.profile.emails).value
        }, function(err, user) {

          if (err || !user) {
            if (err) {
              return callback(false);
            }

            logger.log('[social.facebook] - No matching user found via email, creating new user');

            return createUser();
          }
          else {

            logger.log('[social.facebook] - Matched user via email, updating user');

            data.user = user;

            return saveUser();
          }
        });
      }
      else {
        logger.log('[social.facebook] - Matched user via social id, signin user');
        data.user = user;

        return signinUser();
      }
    });
  };

  // Function to create user
  var createUser = function() {

    logger.log('[social.facebook] - Creating user');

    // Define data
    var email = data.facebookUser.profile.emails;
    var name = data.facebookUser.profile.displayName;
    var id = data.facebookUser.profile.id;

    // Structure data
    var userData = {
      email: email.length ? _.first(data.facebookUser.profile.emails).value : null,
      username: data.facebookUser.profile.username || tools.createUsername(name, id),
      name: (name) ? name : null,
      media: {
        avatar: {
          origin: 'facebook'
        }
      },
      avatars: {
        facebook: 'https://graph.facebook.com/' + data.facebookUser.profile.id + '/picture?type=large'
      }
    };

    logger.log('[social.facebook] - user create data:', userData);

    // Create user
    data.user = new User.model(userData);

    logger.log('[social.facebook] - Created new instance of user');

    return saveUser();
  };

  var saveUser = function() {

    // Save the user data
    logger.log('[social.facebook] - Saving user');

    var userData = {
      social: {
        facebook: {
          isConfigured: true,
          profileId: data.facebookUser.profile.id,
          accessToken: data.facebookUser.accessToken
        }
      }
    };

    logger.log('[social.facebook] - user update data:', userData);

    data.user.set(userData);

    data.user.save(function(err) {

      if (err) {
        logger.log(err);
        logger.log("[social.facebook] - Error saving user");
        return callback(err);

      }
      else {

        logger.log("[social.facebook] - Saved user");

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

    logger.log('[social.facebook] - Signing user');

    var onSuccess = function(user) {
      logger.log("[social.facebook] - Successfully signed");
      return callback();
    };

    var onFail = function(err) {
      logger.log("[social.facebook] - Failed signing in");
      return callback(true);
    };

    keystone.session.signin(String(data.user._id), req, res, onSuccess, onFail);

  };

  // Facebook passport requires two URLs, authenticate and callback.
  // First time, in authenticate flow we call to facebook request access
  // if request has code params, means callback flow.
  if (_.has(req.query, 'code')) {
    logger.log('[social.facebook] - Callback workflow detected, attempting to process data');

    passport.authenticate('facebook', {

    }, function(err, data, info) {

      if (err || !data) {
        logger.log("[social.facebook] - Error retrieving Facebook account data - " + JSON.stringify(err));
        return callback(true);
      }

      logger.log('[social.facebook] - Successfully retrieved Facebook account data, processing');

      return processFBUser(data);

    })(req, res, next);
  }
  else {
    logger.log('[social.facebook] - Authentication workflow detected, attempting to request access');

    passport.authenticate('facebook', {
      scope: ['email']
    })(req, res, next);
  }

};
