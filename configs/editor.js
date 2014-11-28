module.exports = {
  recipe: {
    title: {
      length: 60
    },
    description: {
      length: 400
    },
    portions: {
      max: 20
    },
    time: {
      max: 121
    },
    ingredient: {
      length: 40,
      elements: 50
    },
    procedure: {
      length: 400,
      elements: 15
    },
    image: {
      length: 5 * 1024 * 1024
    }
  },
  profile: {
    name: {
      length: 20
    },
    username: {
      length: 20
    },
    about: {
      length: 400
    },
    image: {
      length: 2.5 * 1024 * 1024
    }
  },
  menu: {
    title: {
      length: 60
    },
    description: {
      length: 400
    },
    recipes: {
      length: 10
    }
  }
};
