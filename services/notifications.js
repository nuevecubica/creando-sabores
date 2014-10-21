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
      user.receiveNewsletter = options.value;
      user.save(function(err) {
        callback(err, user);
      });
    }
  });
};

var setSubscribeNewsletter = function(options, callback) {
  options.value = true;
  return setNewsletter(options, callback);
};

var setUnsubscribeNewsletter = function(options, callback) {
  options.value = false;
  return setNewsletter(options, callback);
};

/*
  Set exportable object
 */
var _service = {
  subscribe: {
    newsletter: setSubscribeNewsletter
  },
  unsubscribe: {
    newsletter: setUnsubscribeNewsletter
  }
};

exports = module.exports = _service;
