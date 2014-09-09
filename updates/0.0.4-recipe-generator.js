var keystone = require('keystone'),
  async = require('async'),
  Recipes = keystone.list('Recipe'),
  Users = keystone.list('User'),
  faker = require('faker'),
  // cloudinary = require('cloudinary'),
  author = null;

faker.random.array_element_pop = function(array) {
  if (!array.length) {
    return null;
  }
  var r = Math.floor(Math.random() * array.length);
  var ret = array.splice(r, 1)[0];
  console.log('ret', ret);
  return ret;
};

function firstUpperCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function newIngredients(min, max) {
  min = min || 5;
  max = max || 25;

  var n = faker.random.number(min, max);
  var ingredients = '';

  for (var i = 0; i < n; ++i) {
    ingredients += '<p>' + faker.Recipe.ingredientUnits() + '</p>';
  }

  return ingredients;
}

function newProcedure() {
  var steps = [];
  for (var i = 0, l = faker.random.number(1, 11); i < l; ++i) {
    steps.push(firstUpperCase(faker.Lorem.paragraph()));
  }
  return '<p>' + steps.join('.</p><p>') + '.</p>';
}

function newDate() {
  // return (new Date(faker.random.number(1, 25) + "-" + faker.random.number(1, 8) + "-" + faker.random.number(13, 14))).toISOString();
  return (new Date(faker.random.number(1, 9))).toISOString();
}

function newHeader() {

  return faker.random.array_element([{
    "public_id": "gibaja35_ashg5j",
    "format": "jpg",
    "version": 1410188043,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:54:03Z",
    "bytes": 1626982,
    "width": 3648,
    "height": 2736,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410188043/gibaja35_ashg5j.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410188043/gibaja35_ashg5j.jpg"
  }, {
    "public_id": "gibaja31_yuoxoq",
    "format": "jpg",
    "version": 1410188042,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:54:02Z",
    "bytes": 2218160,
    "width": 3264,
    "height": 2448,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410188042/gibaja31_yuoxoq.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410188042/gibaja31_yuoxoq.jpg"
  }, {
    "public_id": "gibaja34_a89iur",
    "format": "jpg",
    "version": 1410188040,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:54:00Z",
    "bytes": 1087669,
    "width": 2000,
    "height": 1500,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410188040/gibaja34_a89iur.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410188040/gibaja34_a89iur.jpg"
  }, {
    "public_id": "gibaja32_sngrpn",
    "format": "jpg",
    "version": 1410188038,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:53:58Z",
    "bytes": 507349,
    "width": 1600,
    "height": 1404,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410188038/gibaja32_sngrpn.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410188038/gibaja32_sngrpn.jpg"
  }, {
    "public_id": "gibaja33_zswu1d",
    "format": "jpg",
    "version": 1410188038,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:53:58Z",
    "bytes": 230375,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410188038/gibaja33_zswu1d.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410188038/gibaja33_zswu1d.jpg"
  }, {
    "public_id": "gibaja16_p0vrnr",
    "format": "jpg",
    "version": 1410186822,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:33:42Z",
    "bytes": 2262974,
    "width": 3648,
    "height": 2736,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186822/gibaja16_p0vrnr.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186822/gibaja16_p0vrnr.jpg"
  }, {
    "public_id": "gibaja28_yuqhfa",
    "format": "jpg",
    "version": 1410186734,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:14Z",
    "bytes": 10368307,
    "width": 4368,
    "height": 2912,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186734/gibaja28_yuqhfa.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186734/gibaja28_yuqhfa.jpg"
  }, {
    "public_id": "gibaja25_tsuuls",
    "format": "jpg",
    "version": 1410186726,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:06Z",
    "bytes": 2457969,
    "width": 4288,
    "height": 2848,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186726/gibaja25_tsuuls.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186726/gibaja25_tsuuls.jpg"
  }, {
    "public_id": "gibaja27_oyelna",
    "format": "jpg",
    "version": 1410186725,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:05Z",
    "bytes": 2603626,
    "width": 3264,
    "height": 2448,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186725/gibaja27_oyelna.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186725/gibaja27_oyelna.jpg"
  }, {
    "public_id": "gibaja15_sm0nnh",
    "format": "jpg",
    "version": 1410186724,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:04Z",
    "bytes": 3977681,
    "width": 4608,
    "height": 3456,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186724/gibaja15_sm0nnh.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186724/gibaja15_sm0nnh.jpg"
  }, {
    "public_id": "gibaja30_eqscb9",
    "format": "jpg",
    "version": 1410186723,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:03Z",
    "bytes": 472466,
    "width": 2048,
    "height": 1536,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186723/gibaja30_eqscb9.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186723/gibaja30_eqscb9.jpg"
  }, {
    "public_id": "gibaja20_uppemi",
    "format": "jpg",
    "version": 1410186721,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:01Z",
    "bytes": 4569417,
    "width": 4320,
    "height": 3240,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186721/gibaja20_uppemi.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186721/gibaja20_uppemi.jpg"
  }, {
    "public_id": "gibaja29_htrivo",
    "format": "jpg",
    "version": 1410186721,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:32:01Z",
    "bytes": 174109,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186721/gibaja29_htrivo.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186721/gibaja29_htrivo.jpg"
  }, {
    "public_id": "gibaja24_gkgtuc",
    "format": "jpg",
    "version": 1410186719,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:59Z",
    "bytes": 679266,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186719/gibaja24_gkgtuc.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186719/gibaja24_gkgtuc.jpg"
  }, {
    "public_id": "gibaja23_noys2y",
    "format": "jpg",
    "version": 1410186715,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:55Z",
    "bytes": 508904,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186715/gibaja23_noys2y.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186715/gibaja23_noys2y.jpg"
  }, {
    "public_id": "gibaja26_fcyfxc",
    "format": "jpg",
    "version": 1410186715,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:55Z",
    "bytes": 221612,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186715/gibaja26_fcyfxc.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186715/gibaja26_fcyfxc.jpg"
  }, {
    "public_id": "gibaja21_nceybt",
    "format": "jpg",
    "version": 1410186713,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:53Z",
    "bytes": 215407,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186713/gibaja21_nceybt.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186713/gibaja21_nceybt.jpg"
  }, {
    "public_id": "gibaja19_mad6v9",
    "format": "jpg",
    "version": 1410186713,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:53Z",
    "bytes": 2409553,
    "width": 2592,
    "height": 1728,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186713/gibaja19_mad6v9.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186713/gibaja19_mad6v9.jpg"
  }, {
    "public_id": "gibaja22_ofkq6h",
    "format": "jpg",
    "version": 1410186713,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:53Z",
    "bytes": 385894,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186713/gibaja22_ofkq6h.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186713/gibaja22_ofkq6h.jpg"
  }, {
    "public_id": "gibaja13_zeht9n",
    "format": "jpg",
    "version": 1410186712,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:52Z",
    "bytes": 2542156,
    "width": 3288,
    "height": 2353,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186712/gibaja13_zeht9n.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186712/gibaja13_zeht9n.jpg"
  }, {
    "public_id": "gibaja18_hpsupk",
    "format": "jpg",
    "version": 1410186710,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:50Z",
    "bytes": 1607570,
    "width": 2592,
    "height": 1936,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186710/gibaja18_hpsupk.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186710/gibaja18_hpsupk.jpg"
  }, {
    "public_id": "gibaja12_unmlp6",
    "format": "jpg",
    "version": 1410186704,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:44Z",
    "bytes": 1361839,
    "width": 4580,
    "height": 3090,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186704/gibaja12_unmlp6.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186704/gibaja12_unmlp6.jpg"
  }, {
    "public_id": "gibaja17_eydhwl",
    "format": "jpg",
    "version": 1410186702,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:42Z",
    "bytes": 230333,
    "width": 1600,
    "height": 1071,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186702/gibaja17_eydhwl.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186702/gibaja17_eydhwl.jpg"
  }, {
    "public_id": "gibaja14_vlgabu",
    "format": "jpg",
    "version": 1410186701,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T14:31:41Z",
    "bytes": 229274,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410186701/gibaja14_vlgabu.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410186701/gibaja14_vlgabu.jpg"
  }, {
    "public_id": "gibaja11_lrcqqg",
    "format": "jpg",
    "version": 1410159739,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:19Z",
    "bytes": 4980287,
    "width": 3504,
    "height": 2336,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159739/gibaja11_lrcqqg.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159739/gibaja11_lrcqqg.jpg"
  }, {
    "public_id": "gibaja10_osta9p",
    "format": "jpg",
    "version": 1410159736,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:16Z",
    "bytes": 3933319,
    "width": 3072,
    "height": 2304,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159736/gibaja10_osta9p.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159736/gibaja10_osta9p.jpg"
  }, {
    "public_id": "gibaja06_cwkdz2",
    "format": "jpg",
    "version": 1410159734,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:14Z",
    "bytes": 4569417,
    "width": 4320,
    "height": 3240,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159734/gibaja06_cwkdz2.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159734/gibaja06_cwkdz2.jpg"
  }, {
    "public_id": "gibaja07_ngolcz",
    "format": "jpg",
    "version": 1410159734,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:14Z",
    "bytes": 2497175,
    "width": 3008,
    "height": 2000,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159734/gibaja07_ngolcz.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159734/gibaja07_ngolcz.jpg"
  }, {
    "public_id": "gibaja04_ompq7v",
    "format": "jpg",
    "version": 1410159730,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:10Z",
    "bytes": 2713231,
    "width": 3648,
    "height": 2736,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159730/gibaja04_ompq7v.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159730/gibaja04_ompq7v.jpg"
  }, {
    "public_id": "gibaja03_rhtv6h",
    "format": "jpg",
    "version": 1410159728,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:08Z",
    "bytes": 2785503,
    "width": 3143,
    "height": 2142,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159728/gibaja03_rhtv6h.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159728/gibaja03_rhtv6h.jpg"
  }, {
    "public_id": "gibaja09_n1qgro",
    "format": "jpg",
    "version": 1410159722,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:02Z",
    "bytes": 338210,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159722/gibaja09_n1qgro.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159722/gibaja09_n1qgro.jpg"
  }, {
    "public_id": "gibaja08_ptskdo",
    "format": "jpg",
    "version": 1410159720,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:02:00Z",
    "bytes": 254609,
    "width": 1600,
    "height": 1179,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159720/gibaja08_ptskdo.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159720/gibaja08_ptskdo.jpg"
  }, {
    "public_id": "gibaja02_jnz9wi",
    "format": "jpg",
    "version": 1410159719,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:01:59Z",
    "bytes": 566489,
    "width": 3872,
    "height": 2592,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159719/gibaja02_jnz9wi.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159719/gibaja02_jnz9wi.jpg"
  }, {
    "public_id": "gibaja05_awgqc8",
    "format": "jpg",
    "version": 1410159718,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:01:58Z",
    "bytes": 256399,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159718/gibaja05_awgqc8.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159718/gibaja05_awgqc8.jpg"
  }, {
    "public_id": "gibaja01_bru9vc",
    "format": "jpg",
    "version": 1410159718,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2014-09-08T07:01:58Z",
    "bytes": 209302,
    "width": 1600,
    "height": 1200,
    "url": "http://res.cloudinary.com/glue/image/upload/v1410159718/gibaja01_bru9vc.jpg",
    "secure_url": "https://res.cloudinary.com/glue/image/upload/v1410159718/gibaja01_bru9vc.jpg"
  }]);
}

var homeGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
var sectionGrid = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function generateNewRecipe() {
  var homeHeader = (faker.random.number(1000) >= 800);
  var homeGridPos = faker.random.array_element_pop(homeGrid);
  var sectionHeader = (faker.random.number(1000) >= 800);
  var sectionGridPos = faker.random.array_element_pop(sectionGrid);
  var isPromoted = (homeHeader || sectionHeader || homeGridPos > 0 || sectionGridPos > 0);
  return {
    'description': '<p>' + firstUpperCase(faker.Recipe.findRecipe()) + '. ' + firstUpperCase(faker.Lorem.paragraph()) + '.</p>',
    'ingredients': newIngredients(),
    'isOfficial': (faker.random.number(10) >= 7),
    'procedure': newProcedure(),
    'publishedDate': newDate(),
    'rating': faker.random.number(0, 6),
    'title': firstUpperCase(faker.Recipe.findRecipe()),
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
    "time": faker.random.number(1, 121),
    "difficulty": faker.random.number(1, 6),
    "isBanned": (faker.random.number(10) >= 9 && !isPromoted),
    "state": ((faker.random.number(10) >= 9 && !isPromoted) ? 0 : 1),
    "header": newHeader(),
    "schemaVersion": 1
  };
}

var recipes = [];

for (var i = 0, l = faker.random.number(20, 60); i < l; ++i) {
  recipes.push(generateNewRecipe());
}

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
      console.error("Error adding recipe " + recipe.title + " to the database:");
      console.error(err);
    }
    else {
      console.log("Added recipe " + recipe.title + " to the database.", recipe.isRecipesGridPromoted.position);
    }
    done();
  });
}

exports = module.exports = function(done) {
  Recipes.model.remove({}, function(err) {
    Users.model.findOne({}, function(err, doc) {
      author = doc;
      async.forEach(recipes, createRecipe, done);
    });
  });
};
