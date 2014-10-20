var keystone = require('keystone'),
  async = require('async'),
  Tips = keystone.list('Tip'),
  Users = keystone.list('User'),
  faker = require('faker'),
  moment = require('moment'),
  // cloudinary = require('cloudinary'),
  reindex = require('../goldfinder/reindex'),
  author = null,
  answer = {
    success: false,
    error: false
  };

/*
  Extending faker random object
*/
faker.random.array_element_pop = function(array) {
  if (!array.length) {
    return null;
  }
  var r = Math.floor(Math.random() * array.length);
  var ret = array.splice(r, 1)[0];
  return ret;
};

/*
  Capitalizes the first letter of a sentence
*/
function firstUpperCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/*
  New header image
*/
function newHeader() {
  var headerImages = require('./generateRecipes-headerImages.json');
  return faker.random.array_element(headerImages);
}

/**
 * Generates a random number of tips between a minimum and a maximum (included)
 * @param {Number} from
 * @param {Number} to
 * @return {Array} tips
 */
function generateTips(from, to) {

  /*
    New past date
  */
  function newDate() {
    function randomDate(start, end) {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    var d = randomDate(new Date(2013, 0, 1), new Date());
    return d.toISOString();
  }

  /*
    States
  */
  var states = ['draft', 'published'];

  /*
    New grid positions
  */
  var homeGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  /*
    New final tip object
  */
  function generateNewTip() {

    var homeHeader = (faker.random.number(1000) >= 800);
    var homeGridPos = faker.random.array_element_pop(homeGrid);

    var sectionHeader = (faker.random.number(1000) >= 800);
    var isPromoted = (homeHeader || sectionHeader || homeGridPos > 0);
    var scoreCount = faker.random.number(0, 1000);
    var rating = faker.random.number(0, 6);

    return {
      'tip': firstUpperCase(faker.Lorem.paragraph()) + '. ' + firstUpperCase(faker.Lorem.paragraph()),
      'publishedDate': newDate(),
      'scoreTotal': rating,
      'scoreCount': 1,
      'rating': rating,
      'title': firstUpperCase(faker.Lorem.sentence()),
      "isTipsHeaderPromoted": sectionHeader,
      "isIndexGridPromoted": {
        "position": (homeGridPos || 0),
        "value": (homeGridPos !== null)
      },
      "isIndexHeaderPromoted": homeHeader,
      "isPromoted": isPromoted,
      "state": (!isPromoted) ? states[faker.random.number(0, 2)] : states[1],
      "header": newHeader(),
      "schemaVersion": 1
    };
  }

  var tips = [];

  for (var i = 0, l = faker.random.number(from, to + 1); i < l; ++i) {
    tips.push(generateNewTip());
  }

  return tips;
}


/*
  Let's generate some tips and add them to a clean collection
*/
function createTip(tip, done) {
  tip.author = author;

  var newTip = new Tips.model(tip);
  newTip.save(function(err, tip) {
    if (err) {
      console.error("Error adding tip \"" + tip.title + "\" to the database:");
      console.error(err);
    }
    else {
      console.log("Added tip \"" + tip.title + "\" to the database.");
    }
    done(err, tip);
  });
}

exports = module.exports = function(req, res) {
  var tips = generateTips(40, 80);
  // Clean collection
  Tips.model.remove({}, function(err) {
    // Get an user
    Users.model.findOne({
      isAdmin: true
    }, function(err, doc) {
      if (doc) {
        author = doc;
        // tips next
        console.log('Creating tips...');
        async.forEach(tips, createTip, function(err) {
          if (err) {
            answer.error = true;
            return res.apiResponse(answer);
          }
          else {
            // reindex all
            reindex.run('*', {}, function(err, count) {
              answer.success = true;
              answer.tipsCount = tips.length;
              answer.reindexCount = count;
              return res.apiResponse(answer);
            });
          }
        });
      }
      else {
        answer.error = true;
        return res.apiResponse(answer);
      }
    });
  });
};
