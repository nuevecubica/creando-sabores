var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipe'),
  Users = keystone.list('User'),
  faker = require('faker'),
  generateRecipes = require('../routes/api/v1/admin/generateRecipes'),
  // cloudinary = require('cloudinary'),
  author = null;

exports = module.exports = function(done) {
  generateRecipes(null, {
    apiResponse: function(answer) {
      done();
    }
  });
};
