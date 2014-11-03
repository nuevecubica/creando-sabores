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
exports.notifications = require('./notifications');
exports.recipeList = require('./recipeList');
exports.questionList = require('./questionList');
exports.tipList = require('./tipList');
exports.userList = require('./userList');
exports.pageHeader = require('./pageHeader');
exports.config = require('./config');
exports.elastic = require('./elastic');
exports.seasonList = require('./seasonList');
exports.grid = require('./grid');
exports.contestList = require('./contestList');
exports.email = require('./email');
exports.menuList = require('./menuList');

module.exports = exports;
