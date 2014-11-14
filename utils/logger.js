var config = require('../config.js');
var ln = require("ln");
var util = require("util");
var _ = require("underscore");
ln.PIPE_BUFF = 512;

var defaults = config.logger.appenders.default || [{
  "level": "debug",
  "type": "file",
  "path": "[" + config.logger.path + "default.log.]YYMMDD",
  "isUTC": true
}];

var getRequest = function(req) {
  var user = null;

  if (req.user) {
    var u = req.user;
    user = {
      id: u.id,
      username: u.username
    };
  }

  return {
    user: user,
    request: {
      "host": req.headers['host'],
      "userAgent": req.headers['user-agent'],
      "method": req.method,
      "url": req.url,
      "remoteAddress": req.connection.remoteAddress,
      "remotePort": req.connection.remotePort
    }
  };
};

var isRequest = function(req) {
  return (req &&
    req.headers &&
    req.headers['host'] &&
    req.headers['user-agent'] &&
    req.method &&
    req.url &&
    req.connection
  );
};

var createLogger = function(name) {
  name = name || "backend";
  var appenders = config.logger.appenders.hasOwnProperty(name) ? config.logger.appenders[name] : defaults;
  var parser = function(args) {

    var fields = {
      m: '',
      j: args
    };

    // if 1st argument is string
    if ('string' === typeof args[0]) {
      // get number of % (TODO ignore %%) => N
      var n = (args[0].match(/%[sdj]/g) || []).length;
      if (n > 0) {
        // utils format with N arguments
        var strings = args.slice(1, n + 1) || [];
        strings.unshift(args[0]);
        fields.m = util.format.apply(args[0], strings);
      }
      else {
        fields.m = args[0];
      }

      if (args.length < (n + 2)) {
        fields.j = null;
      }
      else if (args.length === (n + 2)) {
        fields.j = isRequest(args[n + 1]) ? getRequest(args[n + 1]) : args[n + 1];
      }
      else /*(args.length > (n + 2))*/ {
        fields.j = args.slice(n + 1);
      }
    }

    if (fields.j && fields.j.length && 'function' === typeof fields.j.forEach) {
      fields.j.forEach(function(a, i) {
        // parse request
        if (isRequest(a)) {
          fields.j[i] = a = getRequest(a);
        }
        // strings -> obj
        else if ('string' === typeof a) {
          fields.j[i] = {};
          fields.j[i]['string' + i] = a;
        }
      });

      fields.j = _.extend.apply(null, fields.j);
    }

    return fields;
  };

  var log = new ln(name, appenders, parser);
  log.log = log.debug; // Fix for all the logger.log calls
  return log;
};

exports = module.exports = createLogger;
exports.getRequest = module.exports.getRequest = getRequest;
