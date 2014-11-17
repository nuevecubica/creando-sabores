var service = require(__base + 'services'),
  keystone = require('keystone');

function updateElastic(done) {
  service.elastic._client(null, function(err, client) {
    client.indices.delete({
      index: 'recipes'
    }, function() {
      keystone.list('Recipe').model.createMapping(done);
    });
  });
}

exports = module.exports = updateElastic;
