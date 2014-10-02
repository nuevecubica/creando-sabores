var keystone = require('keystone'),
  es = require('elasticsearch'),
  _ = require('underscore'),
  async = require('async'),
  config = require(__base + 'config');

var _client = null;
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
 * Return an Elasticsearch Client
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
 * Return documents matching a query, aggregations/facets, highlighted snippets, suggestions, and more.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esSearch = function(params, callback) {
  _getClient().search(params, callback);
};

/**
 * Get the number of documents for the cluster, index, type, or a query.
 *
 * http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-count
 *
 * @param  {ES params} params   See Elasticsearch documentation
 * @param  {Function}  callback (err, response, status)
 */
var esCount = function(params, callback) {
  _getClient().count(params, callback);
};

var esMoreLikeThis = function(params, callback) {
  _getClient().mlt(params, callback);
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

var _service = {
  _client: esClient,
  search: esSearch,
  count: esCount,
  mlt: esMoreLikeThis,
  sync: esDatabaseSync
};

exports = module.exports = _service;
