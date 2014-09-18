var keystone = require('keystone'),
  User = keystone.list('User'),
  Recipe = keystone.list('Recipe'),
  formResponse = require('../../utils/formResponse.js'),
  async = require('async');

exports = module.exports = function(req, res) {

  var locals = res.locals,
    view = new keystone.View(req, res);

  var getPublicRecipes = function(userId, cb) {
    var back = '..';
    var q = Recipe
      .paginate({
        page: req.query.page || 1,
        perPage: 5
      })
      .where('author', userId)
      .where('state', 1)
      .where('isBanned', false)
      .where('isRemoved', false)
      .or([{
        'contest.id': null
      }, {
        'contest.state': 'admited'
      }])
      .sort('-editDate')
      .exec(function(err, recipes) {
        if (err) {
          console.error('chefRecipes:', err);
          return formResponse(req, res, back, 'Error: Unknown error', false);
        }
        else {
          cb(recipes.results);
        }
      });
  };

  locals.section = 'publicProfile';

  async.waterfall([

    function(next) {
      var q = User.model.findOne({
        username: req.params.username
      });
      q.exec(function(err, result) {
        if (!err && result) {
          locals.profile = result;
        }
        else {
          return res.notfound(res.__('Not found'));
        }
        next(err, result);
      });
    },

    function(profile, next) {
      switch (req.params.section) {
        case 'recetas':
          /* falls through */
        default:
          getPublicRecipes(profile._id, function(recipes) {
            locals.subsection = 'recipes';
            locals.recipes = recipes || [];
            view.render('chef');
          });
      }

    }

  ]);


};
