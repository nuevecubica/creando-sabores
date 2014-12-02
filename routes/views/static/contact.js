var keystone = require('keystone'),
  service = require(__base + 'services'),
  clean = require(__base + 'utils/cleanText.js'),
  formResponse = require(__base + 'utils/formResponse.js');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  // Set locals
  locals.section = 'contact';
  locals.hideSocial = true;
  locals.title = res.__('Contact');

  view.on('post', {
    action: 'contact-form'
  }, function(next) {

    if (req.body.url) {
      return;
    }

    req.body.name = req.user ? req.user.name : clean(req.body.name, ['plaintext', 'oneline', ['maxlength', 50]]);
    req.body.email = req.user ? req.user.email : clean(req.body.email, ['plaintext', 'oneline', ['maxlength', 50]]);
    req.body.comment = clean(req.body.comment, ['plaintext', ['maxlength', 300]]);

    service.email.send('contact-form', {
      to: {
        name: 'Contacto',
        email: keystone.get('site').email
      },
      globalMergeVars: {
        subject: 'Contacto formulario',
        sender_name: req.body.name,
        sender_email: req.body.email,
        topic: req.body.comment
      }
    }, function(err) {
      if (!err) {
        return formResponse(req, res, '/contacto', false, 'Your message has been sent. Thank you.');
      }
      else {
        return formResponse(req, res, '/contacto', 'Error: Unknown error', false);
      }
    });

  });

  // Render the view
  view.render('static/contact');
};
