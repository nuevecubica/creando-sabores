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
      q: $('#search-query').val(),
      page: 1,
      perPage: 5
    };
    var url = '/api/v1/search?' + $.param(args);
    var $results = $('#results');
    $results.removeClass('loaded no-results').addClass('loading');

    var jQXhr = $.getJSON(url).done(function(data) {
      var items = data.results.results;
      if (!items.length) {
        $results.removeClass('loading loaded').addClass('no-results');
        $('#results .list').html('');
        return;
      }
      $results.removeClass('loading no-results').addClass('loaded');
      getTemplate('search', items, function(tpl, items) {
        var html = '';
        for (var i = 0, l = items.length; i < l; i++) {
          html += tpl(items[i]);
        }
        $('#results .list').html(html);

        var extraargs = {
          q: args.q
        };
        makePaginable('/api/v1/search', 'results', 'search', '#results .list', extraargs);
      });
    });

    e.preventDefault();
  });

});
