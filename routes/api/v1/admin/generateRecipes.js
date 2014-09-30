var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipe'),
  Users = keystone.list('User'),
  faker = require('faker'),
  // cloudinary = require('cloudinary'),
  author = null,
  answer = {
    success: false,
    error: false
  };

/**
 * Generates a random number of recipes between a minimum and a maximum (included)
 * @param {Number} from
 * @param {Number} to
 * @return {Array} recipes
 */
function generateRecipes(from, to) {
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

  var maxVideorecipes = 20,
    maxVideorecipesGrid = 5,
    countVideorecipes = 0,
    countVideorecipesGrid = 0;

  /*
    New final recipe object
  */
  function generateNewRecipe() {
    var homeHeader = false;
    var homeGridPos = 0;

    var isVideorecipe = (countVideorecipes < maxVideorecipes) ? (faker.random.number(1000) >= 800) : false;

    if (!isVideorecipe) {
      homeHeader = (faker.random.number(1000) >= 800);
      homeGridPos = faker.random.array_element_pop(homeGrid);
    }

    var sectionHeader = (faker.random.number(1000) >= 800);
    var sectionGridPos = faker.random.array_element_pop(isVideorecipe ? sectionVideoGrid : sectionGrid);
    var isPromoted = (homeHeader || sectionHeader || homeGridPos > 0 || sectionGridPos > 0);

    return {
      'description': '<p>' + firstUpperCase(faker.Recipe.findRecipe()) + '. ' + firstUpperCase(faker.Lorem.paragraph()) + '.</p>',
      'ingredients': newIngredients(),
      'isOfficial': (faker.random.number(10) >= 7),
      'procedure': newProcedure(),
      'publishedDate': newDate(),
      'rating': faker.random.number(0, 6),
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

/*
  Let's generate some recipes and add them to a clean collection
*/
function createRecipe(recipe, done) {
  recipe.author = author;
  if (recipe.rating > 0) {
    recipe.review = [{
      user: 'Demo',
      rating: recipe.rating
    }];
  }
  var newRecipe = new Recipes.model(recipe);
  newRecipe.save(function(err) {
    if (err) {
      console.error("Error adding recipe \"" + recipe.title + "\" to the database:");
      console.error(err);
    }
    else {
      console.log("Added recipe \"" + recipe.title + "\" to the database.");
    }
    done();
  });
}

exports = module.exports = function(req, res) {
  var recipes = generateRecipes(40, 80);
  // Clean collection
  Recipes.model.remove({}, function(err) {
    // Get an user
    Users.model.findOne({
      isAdmin: true
    }, function(err, doc) {
      if (doc) {
        // Assign it to the recipes
        author = doc;
        async.forEach(recipes, createRecipe, function(err) {
          if (err) {
            answer.error = true;
          }
          else {
            answer.success = true;
            answer.recipesCount = recipes.length;
          }
          return res.apiResponse(answer);
        });
      }
      else {
        answer.error = true;
        return res.apiResponse(answer);
      }
    });
  });
};
