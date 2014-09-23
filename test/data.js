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
  }],
  /**
   * This object is extended with the data from the database
   */
  "db": require('./database.json')
};

/**
 * Returns an array of objects
 * @param  {String} collection Collection name
 * @param  {String} field      Field name
 * @param  {Any}    value      Value to compare or a callback
 * @param  {String} orderBy    Optional. Order criteria, leaded with minus (-) or plus (+)
 * @return {Array}             List of documents
 */
data.getBy = function(collection, field, value, orderBy) {
  var reply = data.db[collection].filter(function filter(doc) {
    if (doc.hasOwnProperty(field)) {
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
    if (orderBy[0] === '-') {
      orderBy = orderBy.substr(1);
      reply.sort(function sort(a, b) {
        return (b[orderBy] > a[orderBy] ? -1 : 1);
      });
    }
    else {
      if (orderBy[0] === '+') {
        orderBy = orderBy.substr(1);
      }
      reply.sort(function sort(a, b) {
        return (b[orderBy] > a[orderBy] ? 1 : -1);
      });
    }
  }

  return reply;
};

/**
 * Subfunction example that returns one document by its slug
 * @param  {String} collection Collection name
 * @param  {String} slug       Value to look for
 * @param  {String} orderBy    Optional. Fixes the order.
 * @return {Object}            Document
 */
data.getBySlug = function(collection, slug, orderBy) {
  var reply = data.getBy(collection, 'slug', slug, orderBy);
  return reply.length ? reply[0] : null;
};

module.exports = data;
