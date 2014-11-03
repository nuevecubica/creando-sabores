var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

/**
 * Reads users from the database
 *
 * @param  {Object}   options { flag: '+receiveNewsletter' }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getAllUsers = function(options, callback) {
  var data = {};

  options = _.defaults(options || {}, {
    all: false,
    authorId: null,
    populate: [],
    id: null,
    slug: null,
    sort: null,
    flags: [],
    page: 1,
    perPage: 10,
    limit: null,
    one: false,
    states: [],
    exclude: "-password -schemaVersion -social -disableNotifications -disableHelpers -recieveNewsletter -canLogin -canAdmin -canPublish -canAccessKeystone -resetPasswordToken -resetPasswordDatetime -verifyEmailToken",
    select: ""
  });

  var query = queryMaker(User, options);

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllUsers
};

exports = module.exports = _service;
