/**
 * Data to be used by tests
 * @type {Object}
 */
var data = {
  "admins": [{
    "name": "Admin",
    "email": "user@keystonejs.com",
    "password": "admin",
    "username": "admin",
    "about": "Admin",
    "isPrivate": false,
    "isDeactivated": false,
    "isAdmin": true,
    "media": {
      "avatar": {
        "origin": "none"
      }
    }
  }],
  "users": [{
    "about": "Test User 1",
    "email": "testUser1@glue.gl",
    "username": "testUser1",
    "password": "testUser1",
    "name": "Test User1"
  }, {
    "about": "Test User 2",
    "email": "testUser2@glue.gl",
    "username": "testUser2",
    "password": "testUser2",
    "name": "Test User2"
  }, {
    "about": "Test Bad User",
    "email": "testBadUser@glue.gl",
    "username": "testbaduser",
    "password": "testBadUser",
    "name": "Test Bad User"
  }, {
    "about": "Test User Banned",
    "email": "testUserBanned@glue.gl",
    "username": "testUserBanned",
    "password": "testUserBanned",
    "name": "Test User Banned"
  }, {
    "about": "Test User 4",
    "email": "testUser4@glue.gl",
    "username": "testuser4",
    "password": "testUser4",
    "name": "Test User4"
  }],
  /**
   * This object is extended with the data from the database
   */
  "db": require('./database.json')
};

/**
 * Returns an array of objects
 * @param  {String} collection Collection name
 * @param  {Mixed}  field      Field name or a callback
 * @param  {Mixed}  value      Value to compare or a callback
 * @param  {Mixed}  orderBy    Optional. Order criteria, function or string leaded with minus (-) or plus (+)
 * @return {Array}             List of documents
 */
data.getBy = function(collection, field, value, orderBy) {
  var sub = [];
  if ('object' === typeof collection) {
    sub = collection;
  }
  else {
    sub = data.db[collection];
  }

  var reply = sub.filter(function filter(doc) {
    if ('function' === typeof field) {
      return !!field(doc);
    }
    else if (doc.hasOwnProperty(field)) {
      if ('function' === typeof value) {
        return !!value(doc[field]);
      }
      else {
        return (doc[field] === value);
      }
    }
    return false;
  });

  if (orderBy) {
    if ('function' === typeof orderBy) {
      reply.sort(orderBy);
    }
    else {
      if (orderBy[0] === '-') {
        orderBy = orderBy.substr(1);
        reply.sort(function sort(a, b) {
          if (b[orderBy] === a[orderBy]) {
            return 0;
          }
          else {
            return (b[orderBy] > a[orderBy] ? -1 : 1);
          }
        });
      }
      else {
        if (orderBy[0] === '+') {
          orderBy = orderBy.substr(1);
        }
        reply.sort(function sort(a, b) {
          if (b[orderBy] === a[orderBy]) {
            return 0;
          }
          else {
            return (b[orderBy] > a[orderBy] ? 1 : -1);
          }
        });
      }
    }
  }

  return reply;
};

/**
 * Subfunction example that returns one document by its slug
 * @param  {String} collection Collection name
 * @param  {String} slug       Value to look for
 * @param  {Mixed}  orderBy    Optional. Fixes the order.
 * @return {Object}            Document
 */
data.getBySlug = function(collection, slug, orderBy) {
  var reply = data.getBy(collection, 'slug', slug, orderBy);
  return reply.length ? reply[0] : null;
};

/**
 * Subfunction that returns one user by its username
 * @param  {String} username   Value to look for
 * @return {Object}            Document
 */
data.getUserByUsername = function(username) {
  var reply = data.getBy('users', 'username', username);
  return reply.length ? reply[0] : null;
};

/**
 * Subfunction that returns recipes
 * @param  {Mixed}  field      Field name or a callback
 * @param  {Mixed}  value      Value to compare or a callback
 * @param  {Mixed}  orderBy    Optional. Order criteria, function or string leaded with minus (-) or plus (+)
 * @return {Array}             List of documents
 */
data.getRecipesBy = function(field, value, orderBy) {
  var sub = data.getBy('recipes', 'isVideorecipe', false);
  var reply = data.getBy(sub, field, value, orderBy);
  return reply;
};

/**
 * Subfunction that returns videorecipes
 * @param  {Mixed}  field      Field name or a callback
 * @param  {Mixed}  value      Value to compare or a callback
 * @param  {Mixed}  orderBy    Optional. Order criteria, function or string leaded with minus (-) or plus (+)
 * @return {Array}             List of documents
 */
data.getVideorecipesBy = function(field, value, orderBy) {
  var sub = data.getBy('recipes', 'isVideorecipe', true);
  var reply = data.getBy(sub, field, value, orderBy);
  return reply;
};

module.exports = data;
