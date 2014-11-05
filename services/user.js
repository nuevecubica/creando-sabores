var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  modelCleaner = require(__base + 'utils/modelCleaner.js'),
  service = require('./index');

/**
 * Reads the user's shopping list from the database
 * @param  {Object}   options { field: null, user: null, page: 1, perPage: 10 }
 * @param  {Function} callback (err, results)
 * @return {null}
 */
var getUserList = function(collection, options, callback) {

  options = _.defaults(options || {}, {
    field: null,
    user: null,
    page: 1,
    perPage: 10,
    exclude: ["password"]
  });

  var getUserListQuery = function(ids) {
    var q = keystone.list(collection).model.find({
        '_id': {
          $in: ids
        }
      })
      .where('state', 'published')
      .sort('title');
    return q;
  };

  var sortCollection = function(items, collectionIds, done) {
    // We got the collection (one way or another...)
    // Fix the ingredient list
    for (var i = 0, l = items.length; i < l; i++) {
      items[i] = items[i].toObject({
        virtuals: true,
        transform: modelCleaner.transformer
      });

      if (collection === 'Recipe') {
        var ingr = items[i].ingredients;
        ingr = _.compact(ingr.replace(/(<\/p>|\r|\n)/gi, '').split('<p>'));
        items[i].ingredients = ingr;
      }
    }
    // Sort it in the same order as our list, or order will be block-level
    var collection2 = [];
    var collectionIdsStr = _.map(collectionIds, String);
    var collectionStr = _.map(items, function(r) {
      return String(r._id);
    });

    for (i = 0, l = items.length; i < l; i++) {
      var pos = collectionIdsStr.indexOf(collectionStr[i]);
      collection2[pos] = items[i];
    }

    items = collection2;
    // Return a paginable-like structure
    var total = userlist.length,
      totalPages = Math.ceil(total / perPage),
      ret = {
        total: total,
        currentPage: page,
        totalPages: totalPages,
        pages: [],
        previous: page > 1 ? page - 1 : false,
        next: page < totalPages ? page + 1 : false,
        first: first + 1,
        last: last
      };
    ret.results = items;
    done(null, ret);
  };

  var page = options.page || 1,
    perPage = options.perPage || 10,
    first = (page - 1) * perPage;

  if (!options.user) {
    return callback('Not allowed', null);
  }

  if (!options.field) {
    return callback('Bad request', null);
  }

  var field = options.field.split('.');
  var userlist = (field.length === 1) ? options.user[field[0]] : options.user.favourites[field[1]];
  var last = Math.min(first + perPage, userlist.length);
  var collectionIds = userlist.slice(first, last);

  getUserListQuery(collectionIds)
    .exec(function(err, collections) {

      if (err || !collections) {
        return callback(err || 'Not found', null);
      }
      else if (collections.length !== collectionIds.length) {
        // One or more collections disapeared. Update triggered.
        getUserListQuery(userlist)
          .exec(function(err, allcollections) {

            if (err || !allcollections) {
              return callback(err || 'Not found', null);
            }
            else {
              var aR = _.clone(allcollections);

              options.user[options.field] = aR;
              options.user.save(function(err, doc) {
                userlist = _.map(allcollections, function(collection) {
                  return collection._id;
                });

                last = Math.min(first + perPage, userlist.length);

                collections = allcollections.slice(first, last);
                collectionIds = userlist.slice(first, last);

                sortCollection(collections, collectionIds, callback);
              });
            }
          });
      }
      else {
        sortCollection(collections, collectionIds, callback);
      }
    });
};

var getShoppingList = function(options, callback) {
  options.field = 'shopping';
  return getUserList('Recipe', options, callback);
};

var getFavouritesList = function(options, callback) {
  options.field = 'favourites.recipes';
  return getUserList('Recipe', options, callback);
};

var getUserByUsername = function(options, callback) {
  options = options || {};

  if ('string' === typeof options) {
    options = {
      username: options
    };
  }

  User.model.findOne({
    username: options.username
  }, callback);
};

var getUserByEmail = function(options, callback) {
  options = options || {};

  if ('string' === typeof options) {
    options = {
      email: options
    };
  }

  User.model.findOne({
    email: options.email
  }, callback);
};

var getUserRecipeList = function(options, callback) {

  options = options || {};

  service.recipeList.recipe.get({
    sort: '-editDate',
    page: options.page || 1,
    perPage: options.perPage || 5,
    fromContests: true,
    user: options.user,
    authorId: options.authorId,
  }, callback);
};

var getFavouriteTips = function(options, callback) {
  options.field = 'favourites.tips';
  return getUserList('Tip', options, callback);
};

/*
  Set exportable object
 */
var _service = {
  get: getUserByUsername,
  shopping: {
    get: getShoppingList
  },
  favourites: {
    get: getFavouritesList
  },
  recipeList: {
    get: getUserRecipeList
  },
  tips: {
    get: {
      // list: getMyTips,
      favourites: getFavouriteTips
    }
  }
};

_service.get.byUsername = getUserByUsername;
_service.get.byEmail = getUserByEmail;

exports = module.exports = _service;
