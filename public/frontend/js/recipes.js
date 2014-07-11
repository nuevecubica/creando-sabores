/* global Handlebars */

$(window).load(function() {

  var timeCheckScroll = null,
    counter = 2,
    found = false,
    paginationData = {
      page: 2,
      perPage: 5
    };

  $(document).on('click', '.load-more .button', function(e) {
    e.preventDefault();
    getNextPage();
  });

  $(window).on('scroll', function() {
    clearTimeout(timeCheckScroll);

    console.log(found);

    timeCheckScroll = setTimeout(function() {
      checkScroll();
    }, 200);

  });

  var checkScroll = function() {
    var getData = $('.loader').isOnScreen();

    if (getData && !found) {

      if (counter > 0) {

        found = true;

        getNextPage();
      }
      else {
        $('.loader-more').removeClass('hidden');
        found = true;
      }
    }
  };

  var getNextPage = function() {
    var url = '/api/v1/recipes?' + $.param(paginationData);

    var jQXhr = $.getJSON(url).done(function(data) {

        var items = data.recipes.results;

        getTemplate('recipe', items, function(tpl, items) {
          var html = '';
          for (var i = 0, l = items.length; i < l; i++) {
            html += tpl(items[i]);
          }

          $('#recipes .list').append(html);

          found = $('.loader').isOnScreen();
        });

        if (data.recipes.next) {
          paginationData.page = data.recipes.next;
          counter--;
        }
        else {
          $('.loader .no-more').html('No hay más recetas');
        }

      })
      .fail(function() {
        console.log('error');
      });
  };

  function getTemplate(name, items, callback) {
    return $.get('/templates/hbs/' + name + '.hbs').then(function(src) {
      callback(Handlebars.compile(src), items);
    });
  }

});
