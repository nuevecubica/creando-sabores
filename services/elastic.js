var keystone = require('keystone'),
  es = require('elasticsearch'),
  _ = require('underscore'),
  async = require('async'),
  config = require(__base + 'config'),
  virtual = require(__base + 'models/virtuals'),
  hitsToDocuments = require(__base + 'utils/hitsToDocuments');

var _client = null;

/**
 * Elasticsearch client
 * @param  {Object} _config        Override configuration
 * @return {Elasticsearch Client}
 */
var _getClient = function(_config) {
  var cfg = _config ? _config : config.elasticsearch;
  if (!_client) {
    _client = es.Client({
      host: cfg.url,
      log: cfg.log
    });
  }
  return _client;
};

/**
 * Converts Elasticsearch results into pseudo-models or models.
 *
 * If hydrate parameter is unset or false, it just adds virtuals to results.
 * Otherwise it returns full Keystone items.
 *
 * Options:
 *   withEs: include ES metadata in documents.
 *
 * @param {Function} callback Standard ES callback (err, results, status)
 * @param {Object}   options  Options or hydrate (mongoose) options
 * @param {Bool}     hydrate  Return keystone items?
 */
var _setVirtuals = function(callback, options, hydrate) {
  options = options || {};


  if (!hydrate) {
    // Add virtuals
    return function(err, results, status) {
      if (results && results.hits) {
        var hits = results.hits.hits.map(function(a, i) {
          if (virtual[a._type]) {
            a._source = virtual[a._type]._apply.call(a._source);
          }
          return a;
        });
        results.hits.hits = hitsToDocuments(hits, options.withEs ? options.withEs : false);
      }
      callback(err, results, status);
    };
  }
  else {
    // Call Mongoose and return models
    return function(err, results, status) {
      if (!results || !results.hits) {
        return callback(err, results, status);
      }

      var resultsMap = {},
        modelsMap = {},
        hits = [];

      var ids = results.hits.hits.map(function(a, i) {
        resultsMap[a._id] = i;
        if (!modelsMap[a._type]) {
          modelsMap[a._type] = [];
        }
        modelsMap[a._type].push(a._id);
        return a._id;
      });

      var iterator = function(modelName, next) {
        var model = keystone.list(modelName.capitalize()).model;
        var query = model.find({
          _id: {
            $in: modelsMap[modelName]
          }
        });

        // Build Mongoose query based on hydrate options
        // Example: {lean: true, sort: '-name', select: 'address name'}
        Object.keys(options).forEach(function(option) {
          query[option](options[option]);
        });

        query.exec(function(err, docs) {
          if (err) {
            return next(err);
          }
          else {
            docs.forEach(function(doc) {
              var i = resultsMap[doc._id];
              hits[i] = doc;
            });
            next();
          }
        });
      };

      var end = function(err) {
        results.hits.hits = hits;
        callback(err, results, status);
      };

      async.each(Object.keys(modelsMap), iterator, end);
    };
  }
};

/**
 * Converts Elasticsearch results into Keystone-like pagination info structures
 *
 * @param {Object}   params   Options used to query ES
 * @param {Function} callback Standard ES callback (err, results, status)
 */
var _elasticToKeystone = function(params, callback) {
  var transform = function(err, results, status) {
    var total = results.hits.total,
      perPage = params.body.size,
      first = params.body.from + 1,
      last = Math.min(first + perPage - 1, total),
      currentPage = params.body.from / perPage + 1,
      totalPages = Math.ceil(total / perPage),
      res = {
        total: total,
        results: results.hits.hits,
        currentPage: currentPage,
        totalPages: totalPages,
        pages: _.range(1, totalPages + 1),
        previous: currentPage !== 1 ? currentPage - 1 : false,
        next: currentPage !== totalPages ? currentPage + 1 : false,
        first: first,
        last: last
      };
    callback(err, res, status);
  };
  return _setVirtuals(transform, {
    withEs: true
  });
};

/**
 * Returns an Elasticsearch Client
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/configuration.html
 *
 * @param  {ES config} config   See Elasticsearch Client documentation
 * @param  {Function}  callback (err, client)
 * @return {ES Client} Elasticsearch client
 */
var esClient = function(config, callback) {
  if (!callback) {
    return _getClient();
  }
  else {
    callback(null, _getClient());
  }
};

/**
 * Returns documents matching a query, aggregations/facets, highlighted snippets, suggestions, and more.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esSearch = function(params, callback) {
  _getClient().search(params, _setVirtuals(callback));
};

/**
 * Same as esSearch but it returns Keystone items.
 */
esSearch.hydrated = function(params, callback) {
  _getClient().search(params, _setVirtuals(callback, {}, true));
};

/**
 * Same as esSearch but it returns Keystone-like pagination info.
 */
esSearch.keystoned = function(params, callback) {
  _getClient().search(params, _elasticToKeystone(params, callback));
};

/**
 * Gets the number of documents for the cluster, index, type, or a query.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-count
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esCount = function(params, callback) {
  _getClient().count(params, callback);
};

/**
 * Finds documents that are "like" provided text by running it against one or more fields.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-mlt
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esMoreLikeThis = function(params, callback) {
  _getClient().mlt(params, _setVirtuals(callback));
};

/**
 * Same as esMoreLikeThis but it returns Keystone items.
 */
esMoreLikeThis.hydrated = function(params, callback) {
  _getClient().mlt(params, _setVirtuals(callback, {}, true));
};

/**
 * Suggests similar looking terms based on a provided text by using a specific suggester.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-suggest
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esSuggest = function(params, callback) {
  _getClient().suggest(params, _setVirtuals(callback));
};

/**
 * Same as esSuggest but it returns Keystone items.
 */
esSuggest.hydrated = function(params, callback) {
  _getClient().suggest(params, _setVirtuals(callback, {}, true));
};

/**
 * Syncs the actual database with Elasticsearch
 *
 * https://github.com/jamescarr/mongoosastic
 *
 * @param  {Object}   params   collections (array), each (function), close (function), error (function)
 * @param  {Function} callback (err, count)
 */
var esDatabaseSync = function(params, callback) {
  var count = 0,
    defaults = {
      collections: ['Recipe', 'Contest'],
      each: function(err, doc) {
        count++;
      },
      close: function(err, next) {
        if (err) {
          console.error('service.elastic.sync error', err);
        }
        return next(err);
      },
      error: function(err, next) {}
    },
    answer = {
      success: false,
      error: false
    };

  callback = callback ? callback : function() {};
  params = _.defaults(params || {}, defaults);

  var iterator = function(collection, next) {
    var list = keystone.list(collection);

    if (list) {
      var stream = list.model.synchronize();

      stream.on('data', function(err, doc) {
        params.each(err, doc);
      });

      stream.on('close', function(err) {
        params.close(err, next);
      });

      stream.on('error', function(err) {
        params.error(err, next);
      });
    }
    else {
      return next('No list ' + collection);
    }
  };

  var end = function(err) {
    callback(err, count);
  };

  async.each(params.collections, iterator, end);
};

/**
 * Elastic Service
 *
 * Functions mapping:
 *
 *   _client: esClient
 *   search: esSearch
 *   count: esCount
 *   mlt: esMoreLikeThis
 *   sync: esDatabaseSync
 *
 * @type {Object}
 */
var _service = {
  _client: esClient,
  search: esSearch,
  count: esCount,
  mlt: esMoreLikeThis,
  suggest: esSuggest,
  sync: esDatabaseSync
};

exports = module.exports = _service;
