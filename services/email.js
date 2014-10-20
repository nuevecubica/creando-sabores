var _ = require('underscore'),
  async = require('async'),
  keystone = require('keystone'),
  handlebars = require('handlebars');

var getContentTpl = function(id, callback) {
  var email = keystone.list('Email');
  email.model.findOne({
    name: id,
    state: 'published'
  }).exec(function(err, tpl) {
    var res = {
      name: tpl.name,
      subject: handlebars.compile(tpl.subject),
      title: handlebars.compile(tpl.title),
      body: handlebars.compile(tpl.body)
    };
    callback(err, res);
  });
};

/**
 * Sends an email
 * @param  {String}   id       Email identifier
 * @param  {Oject}    options  {to, subject, user, from, locals}
 * @param  {Function} callback err
 */
var send = function(id, options, callback) {

  _.defaults(options, {
    userId: null, // To do
    user: null,
    to: null,
    subject: null,
    title: null,
    body: null,
    from: {
      name: 'Do not reply',
      email: 'noreply@byglue.me'
    },
    locals: keystone.get('email locals') || {},
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


  if (options.templateId) {
    // Mandrill template
    return callback('Template method not supported yet');
  }
  else {
    getContentTpl(id, function(err, tpl) {
      options = _.omit(_.extend(options, options.locals), ['locals', 'templateId']);

      options.subject = options.subject || tpl.subject(options);
      options.title = options.title || tpl.title(options);
      options.body = options.body || tpl.body(options);

      if (!options.subject) {
        return callback('No subject');
      }

      var em = new keystone.Email(id);
      em.send(options, callback);
    });
  }
};

/*
  Set exportable object
 */
var _service = {
  send: send
};

exports = module.exports = _service;
