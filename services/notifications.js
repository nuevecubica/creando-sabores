var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  service = require('./index');

var setNewsletter = function(options, callback) {
  return service.user.get.byEmail(options, function(err, user) {
    if (err || !user) {
      callback(err);
    }
    else {
      if (user.checkToken(options.token)) {
        user.receiveNewsletter = options.value;
        user.save(function(err) {
          callback(err, user);
        });
      }
      else {
        callback('Invalid token');
      }
    }
  });
};

var checkNewsletter = function(options, callback) {
  return service.user.get.byEmail(options, function(err, user) {
    if (err || !user) {
      callback(err);
    }
    else {
      callback(err, user);
    }
  });
};

var setSubscribeNewsletter = function(options, callback) {
  options = _.defaults(options || {}, {
    value: true
  });
  return setNewsletter(options, callback);
};

var setUnsubscribeNewsletter = function(options, callback) {
  options = _.defaults(options || {}, {
    value: false
  });
  return setNewsletter(options, callback);
};

/*
  Set exportable object
 */
var _service = {
  check: checkNewsletter,
  subscribe: {
    newsletter: setSubscribeNewsletter
  },
  unsubscribe: {
    newsletter: setUnsubscribeNewsletter
  }
};

exports = module.exports = _service;
