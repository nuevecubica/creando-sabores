/* global Handlebars */

$(window).load(function() {

  var timeCheckScroll = null,
    counter = 2,
    found = false,
    paginationData = {
      page: 2,
      perPage: 5
    };

  $(document).on('click', '.load-button', function(e) {
    e.preventDefault();
    getNextPage();
  });

  $(window).on('scroll', function() {
    clearTimeout(timeCheckScroll);

    timeCheckScroll = setTimeout(function() {
      checkScroll();
    }, 50);

  });

  var checkScroll = function() {
    var isLoaderOnScreen = $('.loader').isOnScreen();

    if (isLoaderOnScreen && !found) {

      // Show "Loading" message
      $('.loader > .column').removeClass('show');
      $('.loader .loading').addClass('show');

      if (counter > 0) {

        found = true;

        setTimeout(function() {
          getNextPage();
        }, 500);
      }
      else {
        // Show "Load more" button
        $('.loader > .column').removeClass('show');
        $('.loader .load-more').addClass('show');
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

          //$('#recipes .list').append(html);
          $(html).css('display', 'none').appendTo('#recipes .list').slideDown(function() {
            // Is loader on screen after append recipes?
            found = $('.loader').isOnScreen();
          });

          // hidden all messages
          $('.loader > .column').removeClass('show');
        });

        if (data.recipes.next) {
          paginationData.page = data.recipes.next;
          counter--;
        }
      })
      .fail(function() {
        console.log('error');

        setTimeout(function() {
          getNextPage();
        }, 3000);
      });
  };

  function getTemplate(name, items, callback) {
    return $.get('/templates/hbs/' + name + '.hbs').then(function(src) {
      callback(Handlebars.compile(src), items);
    });
  }

});
