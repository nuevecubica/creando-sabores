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
exports.recipeList = require('./recipeList');
exports.pageHeader = require('./pageHeader');
exports.config = require('./config');

module.exports = exports;
