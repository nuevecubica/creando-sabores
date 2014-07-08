var keystone = require('keystone'),
  async = require('async'),
  Configs = keystone.list('Config');

var configs = [
  {
    name: 'grid_order_desktop_home',
    value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10'
  },
  {
    name: 'grid_size_desktop_home',
    value: 'small, small, small, medium, large, small, small, small, medium, large'
  },
  {
    name: 'grid_order_tablet_home',
    value: '1, 2, 3, 5, 6, 7, 8, 4, 9, 10'
  },
  {
    name: 'grid_size_tablet_home',
    value: 'small, small, small, large, small, small, small, medium, medium, small'
  },
  {
    name: 'grid_order_mobile_home',
    value: '1, 2, 5, 3, 6, 4, 7, 8, 9, 10'
  },
  {
    name: 'grid_size_mobile_home',
    value: 'small, small, large, small, small, medium, small, small, medium, small'
  },
  {
    name: 'grid_order_desktop_recipes',
    value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10'
  },
  {
    name: 'grid_size_desktop_recipes',
    value: 'small, small, small, medium, large, small, small, small, medium, large'
  },
  {
    name: 'grid_order_tablet_recipes',
    value: '1, 2, 3, 5, 6, 7, 8, 4, 9, 10'
  },
  {
    name: 'grid_size_tablet_recipes',
    value: 'small, small, small, large, small, small, small, medium, medium, small'
  },
  {
    name: 'grid_order_mobile_recipes',
    value: '1, 2, 5, 3, 6, 4, 7, 8, 9, 10'
  },
  {
    name: 'grid_size_mobile_recipes',
    value: 'small, small, large, small, small, medium, small, small, medium, small'
  }
];

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
