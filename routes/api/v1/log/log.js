var _logger = require(__base + 'utils/logger');
var log = _logger("frontend");
var levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

exports = module.exports = function(req, res) {
  var level = levels.indexOf(req.body.level) >= 0 ? req.body.level : 'debug';
  var message = req.body.message || null;
  var user = null;

  if (req.user) {
    var u = req.user;
    user = {
      id: u.id,
      username: u.username
    };
  }

  var data = _logger.getRequest(req) || {};
  data.url = req.body.url || null;
  data.line = req.body.line || null;
  data.browser = req.body.browser || 'unknown';

  log[level](message, data);

  res.status(200);
  res.end();
};
