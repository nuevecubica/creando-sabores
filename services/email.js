var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone');

/**
 * Sends an email
 * @param  {String}   id       Email identifier
 * @param  {Oject}    options  {to, subject}
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var send = function(id, options, callback) {

  _.defaults(options, {
    userId: null, // To do
    user: null,
    to: null,
    subject: '',
    from: {
      name: 'Do not reply',
      email: 'noreply@byglue.me'
    },
    locals: {},
    templateId: null // To do
  });

  if (!options.to) {
    if (options.user) {
      options.to = {
        name: options.user.name,
        email: options.user.email
      };
    }
    else {
      return callback('No recipient');
    }
  }

  if (!options.subject) {
    return callback('No subject');
  }

  if (options.templateId) {
    // Mandrill template
    callback('Template method not supported yet');
  }
  else {
    options = _.omit(_.extend(options, options.locals), ['locals', 'templateId']);
    var em = new keystone.Email(id);
    em.send(options, callback);
  }
};

/*
  Set exportable object
 */
var _service = {
  send: send
};

exports = module.exports = _service;
