var keystone = require('keystone'),
  async = require('async'),
  Email = keystone.list('Email');

var templates = [{
  name: 'forgotten-password',
  subject: '{{user.name}}, ya puedes cambiar tu contraseña',
  title: 'Ya puedes cambiar tu contraseña',
  body: '<p><strong>{{user.name}}</strong>, pulsa en el siguiente enlace para cambiar tu contraseña:</p><p>{{link}}</p>',
  state: 'published'
}];

function createTemplate(tpl, done) {

  new Email.model(tpl).save(function(err) {
    if (err) {
      console.error("Error adding email template " + tpl.name + " to the database:");
      console.error(err);
    }
    else {
      console.log("Added template " + tpl.name + " to the database.");
    }
    done();
  });

}

exports = module.exports = function(done) {
  async.forEach(templates, createTemplate, done);
};
