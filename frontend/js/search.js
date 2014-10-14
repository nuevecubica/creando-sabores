/* global makePaginable, getTemplate */
$(window).load(function() {

  function setSearchType(name) {
    $('.tab a .button').removeClass('active');
    $('#tab-' + name + ' .button').addClass('active');
  }

  function getSearchType() {
    var type = $('.tab .active').closest('a').attr('id').substring(4);
    if (!type) {
      type = '_all';
    }
    return type;
  }

  function getUrlState() {
    var query = {
      q: '',
      idx: '_all'
    };
    // Load GET args
    location.search.substr(1).split("&").forEach(function(item) {
      query[item.split("=")[0]] = item.split("=")[1];
    });
    // Load (and overwrite with) hashbang args (for HTML4 browsers)
    location.hash.substr(3).split("&").forEach(function(item) {
      query[item.split("=")[0]] = item.split("=")[1];
    });
    return query;
  }

  function loadState(state) {
    if (!state) {
      state = getCurrentState();
    }
    $('#search-query').val(state.q);
    setSearchType(state.idx);
    doSearch(state);
  }

  function saveState(state) {
    if (!state) {
      state = getCurrentState();
    }
    var minstate = $.extend({}, state);
    if (minstate.q === '') {
      delete minstate.q;
    }
    if (minstate.idx === '_all') {
      delete minstate.idx;
    }
    var url = $.param(minstate);

    if (history.pushState) {
      url = url === '' ? 'buscar' : '?' + url;
      //console.log('Push State:', state);
      history.pushState(state, '', url);
    }
    else {
      url = url === '' ? '' : '#!?' + url;
      location.hash = url;
    }
    doSearch(state);
  }

  function getCurrentState() {
    return {
      q: $('#search-query').val(),
      idx: getSearchType()
    };
  }

  function doSearch(query) {
    var $results = $('#results'),
      args = {
        q: query.q,
        idx: query.idx,
        page: 1,
        perPage: 5
      },
      url = '/api/v1/search?' + $.param(args);

    if (!query.q.length) {
      $results.removeClass('loading loaded no-results');
      $('#results .list').html('');
      return;
    }

    $results.removeClass('loaded no-results').addClass('loading');

    var jQXhr = $.getJSON(url).done(function(data) {
      if (!data.results || !data.results.results.length) {
        $results.removeClass('loading loaded').addClass('no-results');
        $('#results .list').html('');
        return;
      }
      var items = data.results.results;
      getTemplate('search', items, function(tpl, items) {
        var html = '';
        for (var i = 0, l = items.length; i < l; i++) {
          html += tpl(items[i]);
        }
        $('#results .list').html(html);
        $results.removeClass('loading no-results').addClass('loaded');

        var extraargs = {
          q: args.q,
          idx: args.idx
        };
        makePaginable('/api/v1/search', 'results', 'search', '#results .list', extraargs);
      });
    });
  }

  $('#search-button').on('click', function(e) {
    e.preventDefault();
    saveState();
  });

  $('.tab a').on('click', function(e) {
    e.preventDefault();
    setSearchType(this.id.substring(4));
    saveState();
  });

  window.onpopstate = function(e) {
    //console.log('Pop State:', e.state);
    if (!e.state) {
      loadState(window.chef.basestate);
    }
    else {
      loadState(e.state);
    }
  };

  window.chef.basestate = getUrlState();
  loadState(window.chef.basestate);

});
