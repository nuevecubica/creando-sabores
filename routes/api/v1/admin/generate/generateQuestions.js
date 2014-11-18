var keystone = require('keystone'),
  async = require('async'),
  Questions = keystone.list('Question'),
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
 * Generates a random number of questions between a minimum and a maximum (included)
 * @param {Number} from
 * @param {Number} to
 * @return {Array} questions
 */
function generateQuestions(from, to) {

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
    New final question object
  */
  function generateNewQuestion() {

    var state = (faker.random.number(1000) >= 800) ? 'review' : 'published';
    return {
      'title': firstUpperCase(faker.Lorem.sentence()),
      'answer': firstUpperCase(faker.Lorem.paragraph()),
      'publishedDate': newDate(),
      "state": state,
      "schemaVersion": 1
    };
  }

  var questions = [];

  for (var i = 0, l = faker.random.number(from, to + 1); i < l; ++i) {
    questions.push(generateNewQuestion());
  }

  return questions;
}


/*
  Let's generate some questions and add them to a clean collection
*/
function createQuestion(question, done) {
  question.author = author;
  question.chef = author;

  var newQuestion = new Questions.model(question);
  newQuestion.save(function(err, question) {
    if (err) {
      logger.error("Error adding question \"" + question.title + "\" to the database:");
      logger.error(err);
    }
    else {
      logger.log("Added question \"" + question.title + "\" to the database.");
    }
    done(err, question);
  });
}

exports = module.exports = function(req, res) {
  var questions = generateQuestions(40, 80);
  // Clean collection
  Questions.model.remove({}, function(err) {
    // Get an user
    Users.model.findOne({
      isAdmin: true
    }, function(err, doc) {
      if (doc) {
        author = doc;
        // questions next
        logger.info('Creating questions...');
        async.forEach(questions, createQuestion, function(err) {
          if (err) {
            answer.error = true;
            return res.apiResponse(answer);
          }
          else {
            // reindex all
            reindex.run('*', {}, function(err, count) {
              answer.success = true;
              answer.questionsCount = questions.length;
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
