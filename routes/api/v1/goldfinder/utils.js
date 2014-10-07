var _ = require("underscore");

exports = module.exports = {

  response: function(res) {
    return function(err, results) {
      var answer = {
        success: false,
        error: false
      };

      if (!err && results) {
        answer.success = true;
        answer.results = results;
        return res.apiResponse(answer);
      }
      else {
        answer.error = true;
        answer.errorMessage = err;
        answer.results = results;
        console.log(err);
        return res.apiResponse(answer);
      }
    };
  },

  /**
   * Converts a request into a query ready for ES
   * @param  {Object} req Express router request
   * @return {Object}     ES query
   */
  requestToQuery: function(req, queryCallback) {
    var query = {},
      q = '';

    var defaults = {
      index: '_all'
    };

    q = req.query['q'];

    if (req.query['idx']) {
      query.index = req.query['idx'];
    }

    var page = parseInt(req.query['page']) || 1,
      rpp = parseInt(req.query['perPage']) || 10;

    query.body = queryCallback(q, page, rpp);

    _.defaults(query, defaults);
    return query;
  }
};
