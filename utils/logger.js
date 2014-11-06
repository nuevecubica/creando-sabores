exports = module.exports = (function() {
  var levels = ['error', 'warn', 'info', 'log', 'debug'];

  var logger = {
    debugLevel: 'info'
  };

  if (process.env.NODE_DEBUG && levels.indexOf(process.env.NODE_DEBUG) >= 0) {
    logger.debugLevel = process.env.NODE_DEBUG;
  }

  var colors = require('colors');

  colors.setTheme({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    log: 'blue',
    debug: 'grey'
  });

  logger.print = function() {
    var args = Array.prototype.slice.call(arguments);
    var level = args.shift();


    if ("string" === typeof args[0]) {
      var first = args.shift();
      args.unshift(level.toUpperCase());
      args.unshift(new Date().toISOString());
      args.unshift('%s: %s ' [level.trim()] + first);
    }
    else {
      args.unshift(level.toUpperCase()[level]);
      args.unshift(new Date().toISOString());
      args.unshift('%s: %s ');
    }

    var lev = level.trim();
    if (levels.indexOf(lev) <= levels.indexOf(logger.debugLevel)) {
      console[lev].apply(console, args);
    }
  };

  logger.log = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('log  ');
    this.print.apply(logger, args);
  };

  logger.info = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('info ');
    this.print.apply(logger, args);
  };

  logger.warn = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('warn ');
    this.print.apply(logger, args);
  };

  logger.error = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('error');
    this.print.apply(logger, args);
  };

  return logger;
})();
