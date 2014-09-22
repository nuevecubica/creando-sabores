/**
 * Every service should have the same structure:
 *  service.[name].[subgroups].[action].[filters/modifiers] =
 *    function(options, callback){};
 *
 *  Examples:
 *    service.recipe.get.new
 *    service.config.grid.home.get
 */

exports.recipe = require('./recipe');
<<<<<<< HEAD
exports.user = require('./user');
=======
>>>>>>> 0eb30196565f3b2079f0b89581c8eaab4d2d5c3b
exports.recipeList = require('./recipeList');
exports.pageHeader = require('./pageHeader');
exports.config = require('./config');

module.exports = exports;
