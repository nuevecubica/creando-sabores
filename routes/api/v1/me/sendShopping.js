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

  console.log('SERVICE', req.params.recipe);

  var options = {
    slug: req.params.recipe
  };

  service.recipe.get(options, function(err, recipe) {
    if (!err && recipe) {

      service.email.send('shopping-send', {
        to: {
          name: 'Contacto',
          email: req.user.email
        },
        globalMergeVars: {
          subject: 'Lista de la compra',
          title: recipe.title,
          url: recipe.url,
          ingredients_list: recipe.ingredients
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

    }
    else {
      answer.error = true;
      answer.errorMessage = (err || 'Unknow error');

      return res.apiResponse(answer);
    }

  });

};
