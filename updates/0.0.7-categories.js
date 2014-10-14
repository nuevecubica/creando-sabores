var keystone = require('keystone'),
  async = require('async'),
  Configs = keystone.list('Config');

var configs = [{
  name: 'categories_food',
  value: 'mexicana, italiana, francesa, española, china, japonesa, griega, árabe, americana'
}, {
  name: 'categories_plates',
  value: 'botanas, ensaladas, sopas, pastas, arroz, pescados y mariscos, carnes y aves, postres, desayunos'
}];

function createConfig(config, done) {

  var newConfig = new Configs.model(config);

  newConfig.save(function(err) {
    if (err) {
      console.error("Error adding config " + config.name + " to the database:");
      console.error(err);
    }
    else {
      console.log("Added config " + config.name + " to the database.");
    }
    done();
  });

}

exports = module.exports = function(done) {
  async.forEach(configs, createConfig, done);
};
