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

  var options = {
    slug: req.params.recipe
  };

  service.recipe.get(options, function(err, result) {
    if (!err && result) {

      service.email.send('shopping-send', {
        to: {
          email: req.user.email,
          name: (req.user.name || req.user.username),
        },
        // This should be mergeVars but the variables are not processed correctly.
        globalMergeVars: {
          subject: 'Lista de la compra',
          recipe_title: result.recipe.title,
          url: result.recipe.url,
          ingredients_list: '<ul><li>' + result.recipe.ingredients.join('</li><li>') + '</li></ul>'
        }
      }, function(err, result, options) {
        if (!err) {
          answer.success = true;
          //console.log('RESULT', options, result);
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
