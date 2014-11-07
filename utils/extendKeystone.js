/**
 * Replaces Keystone default with this try catched version
 */
var formResponse = require(__base + 'utils/formResponse.js');

var extendKeystone = function(keystone) {

  keystone.View.prototype._render = keystone.View.prototype.render;

  keystone.View.prototype.render = function(renderFn, locals, callback) {
    var req = this.req,
      res = this.res;

    try {
      this._render.apply(this, arguments);
    }
    catch (err) {
      logger.error('Render error: ', err);
      return formResponse(req, res, '/', "Error: Unknown error", false);
    }
  };
};

module.exports = exports = extendKeystone;
