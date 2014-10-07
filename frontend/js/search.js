/* global makePaginable */
$(window).load(function() {

  /* global Handlebars */
  function getTemplate(name, items, callback) {
    return $.get('/templates/hbs/' + name + '.hbs').then(function(src) {
      callback(Handlebars.compile(src), items);
    });
  }

  function setSearchType(name) {
    $('#tab-all .button').removeClass('active');
    $('#tab-recipes .button').removeClass('active');
    $('#tab-videorecipes .button').removeClass('active');
    $('#tab-tips .button').removeClass('active');
    $('#tab-menus .button').removeClass('active');
    $('#tab-' + name + ' .button').addClass('active');
    $('#search-button').click();
  }

  function getSearchType() {
    var type = $('.tab .active').closest('a').attr('id').substring(4);
    if (type === 'videorecipes') {
      type = 'recipes'; // TODO
    }
    else if (type === 'all') {
      type = null;
    }
    return type;
  }

  $('#search-button').on('click', function(e) {
    var q = $('#search-query').val(),
      idx = getSearchType(),
      $results = $('#results'),
      args = {
        q: q,
        idx: idx,
        page: 1,
        perPage: 5
      },
      url = '/api/v1/search?' + $.param(args);

    $results.removeClass('loaded no-results').addClass('loading');

    var jQXhr = $.getJSON(url).done(function(data) {
      if (!data.results || !data.results.results.length) {
        $results.removeClass('loading loaded').addClass('no-results');
        $('#results .list').html('');
        return;
      }
      var items = data.results.results;
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

  $('.tab a').on('click', function(e) {
    setSearchType(this.id.substring(4));
    e.preventDefault();
  });
  setSearchType('all');

});
