var imageQuality = require(__base + 'utils/imageQuality');

var defaults = {
  images: {
    header: '/images/default_recipe.jpg'
  }
};

exports = module.exports = {
  canBeShown: function() {
    return (this.state !== 'banned' && this.state !== 'removed');
  },
  thumb: function() {
    return {
      'list': this._.header.src({
        transformation: 'list_thumb'
      }) || defaults.images.header,
      'grid_small': this._.header.src({
        transformation: 'grid_small_thumb'
      }) || defaults.images.header,
      'grid_medium': this._.header.src({
        transformation: 'grid_medium_thumb'
      }) || defaults.images.header,
      'grid_large': this._.header.src({
        transformation: 'grid_large_thumb'
      }) || defaults.images.header,
      'header': this._.header.src({
        transformation: 'header_limit_thumb'
      }) || defaults.images.header,
      'shopping_list': this._.header.src({
        transformation: 'shopping_list_thumb'
      }) || defaults.images.header,
      'hasQuality': imageQuality(this.header).hasQuality
    };
  },
  classes: function() {
    var classes = ['recipe'];
    classes.push('state-' + this.state);

    if (this.contest && this.contest.id) {
      classes.push('contest-recipe');
    }

    if (this.contest.isJuryWinner) {
      classes.push('contest-winner-jury');
    }

    if (this.contest.isCommunityWinner) {
      classes.push('contest-winner-community');
    }
    // return classes;
    return classes.join(' ');
  },
  url: function() {
    return (this.isVideorecipe) ? '/videoreceta/' + this.slug : '/receta/' + this.slug;
  },
  rating: function() {
    if (this.scoreCount === undefined || this.scoreCount === 0) {
      return 0;
    }
    return (this.scoreTotal / this.scoreCount);
  }
};
