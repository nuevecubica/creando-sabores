var config = require('../config.js');
var ln = require("ln");
ln.PIPE_BUFF = 512;

var defaults = config.logger.appenders.default || [{
  "level": "debug",
  "type": "file",
  "path": "[" + config.logger.path + "default.log.]YYMMDD",
  "isUTC": true
}];

var createLogger = function(name) {
  name = name || "backend";
  var appenders = config.logger.appenders.hasOwnProperty(name) ? config.logger.appenders[name] : defaults;
  var log = new ln(name, appenders);
  return log;
};

createLogger.getRequest = function(req) {
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

exports = module.exports = createLogger;
