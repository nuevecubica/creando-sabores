// Everything globally available goes inside this object!
var chef = window.chef;

window.chef.errorMessages = {};
window.chef.errorMessage = function(errorId) {
  if (!chef.errorMessages) {
    return 'Error';
  }
  else {
    return chef.errorMessages[errorId] || 'Error';
  }
};

var activateDropdown = function() {
  // Dropdown
  var dropdown = $('.dropdown');
  var selected = dropdown.find('.itemSelected');
  var options = dropdown.find('.options');
  var item = options.find('.item');


  dropdown.on('click', function() {
    var me = $(this);
    selected = me.find('.itemSelected');
    options = me.find('.options');
    item = options.find('.item');
  }).on('blur', function() {
    $(this).find('.options').slideUp(300).removeClass('show');
  });

  selected.on('click', function() {
    if ($('body').hasClass('mode-editable')) {
      if (options.hasClass('show')) {
        options.slideUp(300).removeClass('show');
      }
      else {
        options.slideDown(300).addClass('show');
      }
    }
  });

  item.on('click', function() {
    var itemContent = $(this).html();

    item.removeClass('selected');

    selected.find('.item').html(itemContent);
    selected.find('.item').attr('data-value', $(this).attr('data-value'));

    $(this).addClass('selected');

    if (options.hasClass('show')) {
      options.slideUp(300).removeClass('show');
    }
  });
};

$(window).load(function() {
  $('body').removeClass('preload');
  $('.error-here:visible').transition('bounce');
});

$(document).ready(function() {

  // Menu
  $('.demo.menu .item').tab();

  $('#menu').on('click', function() {
    $('#menu-box').addClass('open').removeClass('close');
  });

  $('#menu-close').on('click', function() {
    $('#menu-box').removeClass('open').addClass('close');
  });

  $('.messages-close').on('click', function() {
    $('#messages').transition('fade down');
  });

  setTimeout(function() {
    $('#messages').transition('fade down');
  }, 3 * 1000);

  // Grid
  var gridResizer = function() {
    var height = $('.wall .recipe.small:visible').eq(0).width();

    $('.wall .recipe').each(function() {
      if ($(this).hasClass('large')) {
        $(this).height(height * 2);
      }
      else {
        $(this).height(height);
      }
    });
  };

  if ($('.wall')) {
    gridResizer();
    $(window).resize(gridResizer);
    $(window).load(gridResizer);
  }
});



// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function() {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());


// Enable pagination on the current page
/* global Handlebars */
var makePaginable = function(endpoint, hbsname, appendable) {

  var timeCheckScroll = null,
    counter = 2,
    isStillOnScreen = false,
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

    if (isLoaderOnScreen && !isStillOnScreen) {

      // Show "Loading" message
      $('.loader > .column').removeClass('show');
      $('.loader .loading').addClass('show');

      if (counter > 0) {

        isStillOnScreen = true;

        setTimeout(function() {
          getNextPage();
        }, 500);
      }
      else {
        // Show "Load more" button
        $('.loader > .column').removeClass('show');
        $('.loader .load-more').addClass('show');
        isStillOnScreen = true;
      }
    }
  };

  var getNextPage = function() {
    var url = endpoint + '?' + $.param(paginationData);

    var jQXhr = $.getJSON(url).done(function(data) {

        var items = data.recipes.results;

        getTemplate(hbsname, items, function(tpl, items) {
          var html = '';

          for (var i = 0, l = items.length; i < l; i++) {
            html += tpl(items[i]);
          }

          $(html).css('display', 'none').appendTo(appendable).slideDown('slow', function() {
            // Is loader on screen after append recipes?
            isStillOnScreen = $('.loader').isOnScreen();
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

};
