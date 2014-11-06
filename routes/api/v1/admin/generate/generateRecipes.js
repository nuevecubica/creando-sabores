var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipe'),
  Contests = keystone.list('Contest'),
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
  New ingredient list, a random amount between min and max
*/
function newIngredients(min, max) {
  min = min || 3;
  max = max || 25;

  var n = faker.random.number(min, max);
  var ingredients = '';

  for (var i = 0; i < n; ++i) {
    ingredients += '<p>' + faker.Recipe.ingredientUnits() + '</p>';
  }

  return ingredients;
}

/*
  New procedure list, a random amount between min and max
*/
function newProcedure(min, max) {
  min = min || 1;
  max = max || 11;
  var steps = [];
  for (var i = 0, l = faker.random.number(1, 11); i < l; ++i) {
    var paragraphs = [];
    for (var ii = 0, ll = faker.random.number(1, 3); ii < ll; ++ii) {
      paragraphs.push(firstUpperCase(faker.Lorem.paragraph(faker.random.number(1, 5))));
    }
    steps.push(paragraphs.join('. '));
  }
  return '<p>' + steps.join('.</p><p>') + '.</p>';
}

/*
  New header image
*/
function newHeader() {
  var headerImages = require('./generateRecipes-headerImages.json');
  return faker.random.array_element(headerImages);
}

/*
  New header image
*/
function newVideo() {
  var headerVideos = require('./generateRecipes-headerVideos.json');
  return faker.random.array_element(headerVideos);
}


/**
 * Generates a random number of recipes between a minimum and a maximum (included)
 * @param {Number} from
 * @param {Number} to
 * @return {Array} recipes
 */
function generateRecipes(from, to) {

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
  var states = ['draft', 'published', 'review', 'removed', 'banned'];

  /*
    New grid positions
  */
  var homeGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var sectionGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  var sectionVideoGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  var maxVideorecipes = 50,
    maxVideorecipesGrid = 5,
    countVideorecipes = 0,
    countVideorecipesGrid = 0;

  /*
    New final recipe object
  */
  function generateNewRecipe() {
    var homeHeader = false;
    var homeGridPos = null;

    var isVideorecipe = (countVideorecipes < maxVideorecipes) ? (faker.random.number(1000) >= 800) : false;
    if (isVideorecipe) {
      ++countVideorecipes;
      if ((countVideorecipesGrid < maxVideorecipesGrid) && (faker.random.number(1000) >= 800)) {
        ++countVideorecipesGrid;
        homeGridPos = faker.random.array_element_pop(homeGrid);
      }
    }
    else {
      homeHeader = (faker.random.number(1000) >= 800);
      homeGridPos = faker.random.array_element_pop(homeGrid);
    }

    var sectionHeader = (faker.random.number(1000) >= 800);
    var sectionGridPos = faker.random.array_element_pop(isVideorecipe ? sectionVideoGrid : sectionGrid);
    var isPromoted = (homeHeader || sectionHeader || homeGridPos > 0 || sectionGridPos > 0);
    var rating = faker.random.number(0, 6);

    return {
      'description': '<p>' + firstUpperCase(faker.Recipe.findRecipe()) + '. ' + firstUpperCase(faker.Lorem.paragraph()) + '.</p>',
      'ingredients': newIngredients(),
      'isOfficial': (faker.random.number(10) >= 7),
      'procedure': newProcedure(),
      'publishedDate': newDate(),
      'scoreTotal': rating,
      'scoreCount': 1,
      'rating': rating,
      'title': (isVideorecipe ? 'Videorecipe ' : '') + firstUpperCase(faker.Recipe.findRecipe()),
      "isRecipesGridPromoted": {
        "position": (sectionGridPos || 0),
        "value": (sectionGridPos !== null)
      },
      "isRecipesHeaderPromoted": sectionHeader,
      "isIndexGridPromoted": {
        "position": (homeGridPos || 0),
        "value": (homeGridPos !== null)
      },
      "isIndexHeaderPromoted": homeHeader,
      "isPromoted": isPromoted,
      "portions": faker.random.number(1, 15),
      "time": faker.random.number(1, 120),
      "difficulty": faker.random.number(1, 5),
      "state": (!isPromoted) ? states[faker.random.number(0, 4)] : states[1],
      "header": newHeader(),
      "isVideorecipe": isVideorecipe,
      "videoUrl": (isVideorecipe ? newVideo() : null),
      "schemaVersion": 1
    };
  }

  var recipes = [];

  for (var i = 0, l = faker.random.number(from, to + 1); i < l; ++i) {
    recipes.push(generateNewRecipe());
  }

  return recipes;
}


/**
 * Generates a random number of contests between a minimum and a maximum (included)
 * @param {Number} from
 * @param {Number} to
 * @return {Array} contests
 */
function generateContests(from, to) {

  /*
    New dates
  */
  function newDates(state) {
    var programmedDate, submissionDeadline, deadline;

    switch (state) {
      case 'draft':
        programmedDate = moment().add(faker.random.number(30, 90), 'days');
        submissionDeadline = moment(programmedDate).add(faker.random.number(1, 30), 'days');
        deadline = moment(submissionDeadline).add(faker.random.number(1, 7), 'days');
        break;
      case 'programmed':
        programmedDate = moment().add(faker.random.number(1, 30), 'days');
        submissionDeadline = moment(programmedDate).add(faker.random.number(1, 30), 'days');
        deadline = moment(submissionDeadline).add(faker.random.number(1, 7), 'days');
        break;
      case 'submission':
        programmedDate = moment().subtract(faker.random.number(1, 15), 'days');
        submissionDeadline = moment().add(faker.random.number(1, 15), 'days');
        deadline = moment(submissionDeadline).add(faker.random.number(1, 7), 'days');
        break;
      case 'votes':
        submissionDeadline = moment().subtract(faker.random.number(1, 3), 'days');
        programmedDate = moment(submissionDeadline).subtract(faker.random.number(1, 30), 'days');
        deadline = moment().add(faker.random.number(1, 3), 'days');
        break;
      default:
        programmedDate = moment().subtract(faker.random.number(37, 700), 'days');
        submissionDeadline = moment(programmedDate).add(faker.random.number(1, 30), 'days');
        deadline = moment(submissionDeadline).add(faker.random.number(1, 7), 'days');
        break;
    }
    return {
      programmedDate: programmedDate.toISOString(),
      submissionDeadline: submissionDeadline.toISOString(),
      deadline: deadline.toISOString()
    };
  }

  /*
    States
  */
  var states = ['draft', 'programmed', 'submission', 'votes', 'closed', 'finished'];

  /*
    New final contest object
  */
  function generateNewContest() {
    var state = 'finished';

    var isUnfinished = faker.random.number(1000) >= 600;
    if (isUnfinished) {
      state = faker.random.array_element(states);
    }

    var dates = newDates(state);
    var header = newHeader();

    return {
      'description': '<p>' + firstUpperCase(faker.Lorem.paragraph()) + '.</p>',
      'title': firstUpperCase(faker.Company.catchPhrase()),
      'sponsor': faker.Company.companyName(),
      'ingredientRequired': faker.Recipe.ingredientUnits(),
      'state': state,
      'programmedDate': dates.programmedDate,
      'submissionDeadline': dates.submissionDeadline,
      'deadline': dates.deadline,
      'header': header,
      'headerBackgroundRecipe': header,
      'imageContest': header,
      'awards': {
        'jury': {
          'name': firstUpperCase(faker.Lorem.words(3).join(' ')),
          'description': firstUpperCase(faker.Lorem.paragraph())
        },
        'community': {
          'name': firstUpperCase(faker.Lorem.words(3).join(' ')),
          'description': firstUpperCase(faker.Lorem.paragraph())
        }
      },
      'terms': firstUpperCase(faker.Lorem.paragraph()),
      'schemaVersion': 1
    };
  }

  /*
    New contest recipe
  */
  function generateNewContestRecipe() {

    var states = ['draft', 'published', 'review', 'removed', 'banned'],
      start = new Date(c.programmedDate),
      end = new Date(c.submissionDeadline),
      date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    var state = faker.random.number(1000) >= 900 ? faker.random.array_element(states) : 'published';

    return {
      'description': '<p>' + firstUpperCase(faker.Recipe.findRecipe()) + '. ' + firstUpperCase(faker.Lorem.paragraph()) + '.</p>',
      'ingredients': newIngredients(),
      'procedure': newProcedure(),
      'publishedDate': date,
      'title': firstUpperCase(faker.Recipe.findRecipe()),
      'portions': faker.random.number(1, 15),
      'time': faker.random.number(1, 120),
      'difficulty': faker.random.number(1, 5),
      'state': state,
      'likes': faker.random.number(0, 50),
      'header': newHeader(),
      'schemaVersion': 1
    };
  }

  var contests = [];

  for (var i = 0, l = faker.random.number(from, to + 1); i < l; ++i) {
    var c = generateNewContest();
    var contestRecipes = [];
    if (['draft', 'programmed'].indexOf(c.state) === -1) {
      var min = c.state === 'submission' ? 0 : 2;
      for (var j = 0, l2 = faker.random.number(min, 7); j < l2; ++j) {
        var r = generateNewContestRecipe();
        contestRecipes.push(r);
      }
    }
    c.recipes = contestRecipes;
    contests.push(c);
  }

  return contests;
}


/*
  Let's generate some recipes and add them to a clean collection
*/
function createRecipe(recipe, done) {
  recipe.author = author;

  var newRecipe = new Recipes.model(recipe);
  newRecipe.save(function(err, recipe) {
    if (err) {
      logger.error("Error adding recipe \"" + recipe.title + "\" to the database:");
      logger.error(err);
    }
    else {
      logger.log("Added recipe \"" + recipe.title + "\" to the database.");
    }
    done(err, recipe);
  });
}

function createContest(contest, done) {
  var recipes = contest.recipes;
  var state = contest.state;
  delete(contest.recipes);
  var newContest = new Contests.model(contest);
  newContest.save(function(err, contest) {
    if (err) {
      logger.error("Error adding contest \"" + contest.title + "\" to the database:");
      logger.error(err);
      done(err, contest);
    }
    else {
      recipes.map(function(a, i) {
        a.contest = {
          id: contest // They need the ID that we just got...
        };
      });
      async.map(recipes, createRecipe, function(err, recipes) {
        if (err) {
          logger.error("Error adding contest \"" + contest.title + "\" recipes:");
          logger.error(err);
          done(err, contest);
        }
        else {
          if (state === 'finished') {
            contest.state = state;
            contest.awards.jury.winner = faker.random.array_element(recipes);
            contest.save(function(err, contest) {
              if (err) {
                logger.error("Error setting winner of contest \"" + contest.title + "\":");
                logger.error(err);
                done(err, contest);
              }
              else {
                contest.state = state;
                contest.save(function(err, contest) {
                  if (err) {
                    logger.error("Error finishing contest \"" + contest.title + "\":");
                    logger.error(err);
                    done(err, contest);
                  }
                  else {
                    logger.log("Added finished contest \"" + contest.title + "\" to the database.");
                    done(err, contest);
                  }
                });
              }
            });
          }
          else {
            logger.log("Added contest \"" + contest.title + "\" to the database.");
            done(err, contest);
          }
        }
      });
    }
  });
}

exports = module.exports = function(req, res) {
  var recipes = generateRecipes(40, 80);
  var contests = generateContests(5, 10);
  // Clean collection
  Recipes.model.remove({}, function(err) {
    // Clean contests too
    Contests.model.remove({}, function(err) {
      // Get an user
      Users.model.findOne({
        isAdmin: true
      }, function(err, doc) {
        if (doc) {
          author = doc;
          // Contests first
          logger.info('Creating contests...');
          async.forEach(contests, createContest, function(err) {
            if (err) {
              answer.error = true;
              return res.apiResponse(answer);
            }
            else {
              // Recipes next
              logger.info('Creating recipes...');
              async.forEach(recipes, createRecipe, function(err) {
                if (err) {
                  answer.error = true;
                  return res.apiResponse(answer);
                }
                else {
                  // reindex all
                  reindex.run('*', {}, function(err, count) {
                    answer.success = true;
                    answer.recipesCount = recipes.length;
                    answer.contestsCount = contests.length;
                    answer.reindexCount = count;
                    return res.apiResponse(answer);
                  });
                }
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
  });
};
