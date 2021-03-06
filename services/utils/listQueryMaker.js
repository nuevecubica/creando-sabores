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
    one: false,
    states: ['published'],
    select: "",
    exclude: "",
    distinct: null
  });

  var query = {};

  if (options.distinct) {
    options.limit = null;
  }

  if (options.limit) {
    options.perPage = options.limit;
  }

  if ((options.id && !_.isArray(options.id)) || (options.slug && !_.isArray(options.slug))) {
    options.one = true;
  }

  if (options.one) {
    query = List.model.findOne();
  }
  else if (!options.page && !options.distinct) {
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
    if (_.isArray(options.id)) {
      query.where('_id').in(options.id);
    }
    else {
      query.where('_id', options.id);
      options.limit = 1;
      options.distinct = null;
    }
  }
  else if (options.slug) {
    if (_.isArray(options.slug)) {
      query.where('slug').in(options.slug);
    }
    else {
      query.where('slug', options.slug);
      options.limit = 1;
      options.distinct = null;
    }
  }

  var states = options.states || [];

  if (states.length) {
    states = _.unique(states);
    query.in('state', states);
  }

  if (options.flags && options.flags.length > 0) {
    _.each(options.flags, function(flag) {
      // flag is
      if (flag[0] === '-') {
        query.where(flag.substr(1), false);
      }
      else if (flag[0] === '+') {
        query.where(flag.substr(1), true);
      }
      // flag is not
      else if (flag[0] === '!') {
        flag = flag.substr(1);
        if (flag[0] === '-') {
          query.where(flag.substr(1)).ne(false);
        }
        else if (flag[0] === '+') {
          query.where(flag.substr(1)).ne(true);
        }
        else {
          query.where(flag).ne(true);
        }
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
      if (!_.isArray(pop)) {
        pop = [pop];
      }

      query.populate.apply(query, pop);
    });
  }

  // Select
  if (options.select && _.isArray(options.select)) {
    options.select = options.select.join(" ");
  }

  if (!_.isString(options.select)) {
    options.select = "";
  }

  // Exclude
  if (options.exclude && _.isArray(options.exclude)) {
    options.exclude = "-" + options.exclude.join(" -");
  }

  if (!_.isString(options.exclude)) {
    options.exclude = "";
  }

  if (options.select || options.exclude) {
    query.select(options.select + " " + options.exclude);
  }

  // Distinct
  if (options.distinct) {
    query.distinct(options.distinct);
  }

  if (callback) {
    callback(query);
  }
  else {
    return query;
  }
};
