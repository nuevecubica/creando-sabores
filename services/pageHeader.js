var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Recipe = keystone.list('Recipe'),
  Tip = keystone.list('Tip'),
  Menu = keystone.list('Menu');


/**
 * Gets the recipe for the Recipes section header
 * @param  {Object}   options { sort: '-publishDate' }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderRecipe = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Recipe.model.findOne();

  query.where('state', 'published');
  query.where('isRecipesHeaderPromoted', true);
  query.where('isVideorecipe', false);

  if (options.sort) {
    query.sort(options.sort);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Gets the recipe for the Videorecipes section header
 * @param  {Object}   options { sort: '-publishDate' }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderVideorecipe = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Recipe.model.findOne();

  query.where('state', 'published');
  query.where('isRecipesHeaderPromoted', true);
  query.where('isVideorecipe', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Gets the recipe for the Homepage header
 * @param  {Object}   options { sort: '-publishDate' }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderHome = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-isVideorecipe -isOfficial -publishedDate'
  });

  var query = Recipe.model.findOne();

  query.where('state', 'published');
  query.where('isIndexHeaderPromoted', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Get the tip for the tips page
 * @param  {Object}   options  { populate: ['author'], sort: '-publishDate'}
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderTip = function(options, callback) {

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Tip.model.findOne();

  query.where('state', 'published');
  query.where('isTipsHeaderPromoted', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  if (options.populate) {
    query.populate(options.populate);
  }

  query.exec(callback || function() { /* dummy */ });
};

/**
 * Get the menu for the menus page
 * @param  {Object}   options  { }
 * @param  {Function} callback
 * @return {null}
 */
var getHeaderMenu = function(options, callback) {

  options = _.defaults(options || {}, {
    sort: '-publishedDate'
  });

  var query = Menu.model.findOne();

  query.where('state', 'published');
  query.where('isMenusHeaderPromoted', true);

  if (options.sort) {
    query.sort(options.sort);
  }

  if (options.populate) {
    query.populate(options.populate);
  }

  query.exec(callback || function() { /* dummy */ });
};

/*
  Set exportable object
 */
var _service = {
  get: getHeaderHome,
  recipe: {
    get: getHeaderRecipe
  },
  videorecipe: {
    get: getHeaderVideorecipe
  },
  home: {
    get: getHeaderHome
  },
  tip: {
    get: getHeaderTip
  },
  menu: {
    get: getHeaderMenu
  }
};

exports = module.exports = _service;
