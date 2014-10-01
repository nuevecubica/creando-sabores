var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var collection = req.params.collection,
    answer = {
      success: false,
      error: false
    };

  collection = collection.charAt(0).toUpperCase() + collection.slice(1);

  var list = keystone.list(collection);

  if (list) {
    var stream = list.model.synchronize(),
      count = 0;

    stream.on('data', function(err, doc) {
      count++;
    });

    stream.on('close', function() {
      answer.success = true;
      answer.log = "indexed " + count + " documents";
      answer.total = count;
      return res.apiResponse(answer);
    });

    stream.on('error', function(err) {
      answer.error = true;
      answer.errorMessage = err;
      console.log(err);
      return res.apiResponse(answer);
    });
  }
  else {
    answer.error = true;
    return res.apiResponse(answer);
  }
};
