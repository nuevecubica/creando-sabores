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
exports.question = require('./question');
exports.tip = require('./tip');
exports.user = require('./user');
exports.recipeList = require('./recipeList');
exports.questionList = require('./questionList');
exports.tipList = require('./tipList');
exports.pageHeader = require('./pageHeader');
exports.config = require('./config');
exports.elastic = require('./elastic');
exports.seasonList = require('./seasonList');
exports.grid = require('./grid');

module.exports = exports;
