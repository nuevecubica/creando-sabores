exports.initLocals = require('./initLocals').initLocals;

exports.initErrorHandlers = require('./initErrorHandlers').initErrorHandlers;

exports.flashMessages = require('./flashMessages').flashMessages;

var requireUser = require('./requireUser');
exports.requireUser = requireUser.requireUser;
exports.requireUserApi = requireUser.requireUserApi;
exports.requireAdmin = requireUser.requireAdmin;
exports.requireAdminApi = requireUser.requireAdminApi;
exports.requireConfirmed = requireUser.requireConfirmed;
exports.requireConfirmedApi = requireUser.requireConfirmedApi;

var requireTest = require('./requireTest');
exports.requireTestApi = requireTest.requireTestApi;

var antiBadUsers = require('./antiBadUsers');
exports.antiBanned = antiBadUsers.antiBanned;
exports.antiDeactivated = antiBadUsers.antiDeactivated;
exports.antiBadUsers = antiBadUsers.antiBadUsers;
