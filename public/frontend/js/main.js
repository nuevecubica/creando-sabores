// Everything globally available goes inside this object!
var chef = window.chef = {};

window.chef.errorMessages = {};
window.chef.errorMessage = function(errorId) {
  if (!chef.errorMessages) {
    return 'Error';
  }
  else {
    return chef.errorMessages[errorId] ||  'Error';
  }
};

$(window).load(function() {
  $('body').removeClass('preload');
  $('.error-here:visible').transition('bounce');
});

$(document).ready(function() {
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


$(document).ready(function() {

  var gridResizer = function() {
    $('#grid-recipes .recipe').each(function() {
      if ($(this).hasClass('cuatro') || $(this).hasClass('nueve')) {
        $(this).height($(this).width() / 2);
      }
      else {
        $(this).height($(this).width());
      }
    });
  };

  if ($('#grid-recipes')) {
    gridResizer();
    $(window).resize(gridResizer);
  }

});
