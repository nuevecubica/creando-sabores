/* global makePaginable */
$(window).load(function() {

  var section = window.location.pathname.split('/')[1];
  var type = section === 'videorecetas' ? 'videorecipes' : 'recipes';

  makePaginable('/api/v1/' + type, 'recipes', 'recipe', '#recipes .list');

  $('.transient-tab-link').on('click', function(e) {
    e.preventDefault();
    var links = $('.transient-tab-link');
    var childNo = links.index(this);
    $('.transient-tab-link > .active').removeClass('active');
    $(links.get(childNo)).children().first().addClass('active');

    var contents = $('.transient-tab-content');
    $('.transient-tab-content.active').removeClass('active');
    $(contents.get(childNo)).addClass('active');

  });

});
