var _ = require('underscore');

/**
 * Creates a basic service query
 *
 * @param  {Object}   options { sort: null,
 *                            flags: [], limit: null, states: ['published'],
 *                            populate: [], id: null, slug: null,
 *                            page: 1, perPage: 10 }
 * @param  {Function} callback (query)
 * @return {null}
 */
exports = module.exports = function(List, options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    authorId: null,
    populate: [],
    id: null,
    slug: null,
    sort: null,
    flags: [],
    page: 1,
    perPage: 10,
    limit: null,
    states: ['published']
  });

  var query = {};

  if (options.limit) {
    options.perPage = options.limit;
  }

  if (options.id || options.slug) {
    options.limit = 1;
  }

  if (options.limit === 1) {
    query = List.model.findOne();
  }
  else if (!options.page) {
    query = List.model.find();
    if (options.limit || options.perPage) {
      query.limit(options.limit || options.perPage);
    }
  }
  else {
    query = List.paginate({
      page: options.page,
      perPage: options.perPage
    });
  }

  if (options.id) {
    query.where('_id', options.id);
    options.limit = 1;
  }
  else if (options.slug) {
    query.where('slug', options.slug);
    options.limit = 1;
  }

  var states = options.states || [];

  if (states.length) {
    states = _.unique(states);
    query.in('state', states);
  }

  if (options.flags && options.flags.length > 0) {
    _.each(options.flags, function(flag) {
      if (flag[0] === '-') {
        query.where(flag.substr(1), false);
      }
      else if (flag[0] === '+') {
        query.where(flag.substr(1), true);
      }
      else {
        query.where(flag, true);
      }
    });
  }

  if (options.authorId) {
    query.where('author', options.authorId);
  }

  if (options.sort) {
    query.sort(options.sort);
  }

  if (options.populate && options.populate.length) {
    options.populate.forEach(function(pop) {
      query.populate(pop);
    });
  }

  if (callback) {
    callback(query);
  }
  else {
    return query;
  }
};
