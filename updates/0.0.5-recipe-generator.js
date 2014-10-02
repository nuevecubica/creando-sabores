var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipe'),
  Users = keystone.list('User'),
  faker = require('faker'),
  generateRecipes = require(__base + 'routes/api/v1/admin/generate/generateRecipes'),
  // cloudinary = require('cloudinary'),
  author = null;

exports = module.exports = function(done) {
  generateRecipes(null, {
    apiResponse: function(answer) {
      done();
    }
  });
};
