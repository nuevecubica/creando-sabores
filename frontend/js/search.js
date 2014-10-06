/* global makePaginable */
$(window).load(function() {
  //var profile = window.location.pathname.split('/')[2];
  //makePaginable('/api/v1/user/' + profile + '/recipes', 'recipes', 'recipe', '#recipes .list');

  /* global Handlebars */
  function getTemplate(name, items, callback) {
    return $.get('/templates/hbs/' + name + '.hbs').then(function(src) {
      callback(Handlebars.compile(src), items);
    });
  }

  $('#search-button').on('click', function(e) {

    var args = {
      q: $('#search-query').val()
    };
    var url = '/api/v1/search?' + $.param(args);
    var jQXhr = $.getJSON(url).done(function(data) {
      var items = data.results.hits.hits;
      getTemplate('recipe', items, function(tpl, items) {
        var html = '';
        for (var i = 0, l = items.length; i < l; i++) {
          html += tpl(items[i]);
        }
        //$(html).css('display', 'none').html('#results .list').slideDown('slow');
        $('#results .list').html(html);
      });
    });

    e.preventDefault();
  });

});
