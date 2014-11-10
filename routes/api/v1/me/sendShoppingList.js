var async = require('async'),
  keystone = require('keystone'),
  service = require(__base + 'services'),
  hideMyApi = require(__base + 'utils/hideMyApi'),
  safe = require(__base + 'utils/apiSafeFields');

/*
  /me/shopping/send
*/

exports = module.exports = function(req, res) {

  var answer = {
    success: false,
    error: false
  };

  service.email.send('shopping-send', {
    to: {
      name: 'Contacto',
      email: req.user.email
    },
    globalMergeVars: {
      subject: 'Lista de la compra',
      item: req.body.item
    }
  }, function(err) {
    if (!err) {
      answer.success = true;
    }
    else {
      answer.error = true;
      answer.errorMessage = (err || 'Unknow error');
    }

    return res.apiResponse(answer);
  });

};
