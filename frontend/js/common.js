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

  // Edited
  var editable = $('.set-editable');

  var checkLength = function(editable, e) {
    if (editable.text().length >= editable.data('length')) {
      e.preventDefault();
    }
  };

  editable.on('focus', function() {
    $(this).toggleClass('focus');
  }).on('focusout', function() {
    $(this).toggleClass('focus');
  });

  $('.set-editable.one-line').on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
    }
  }).on('paste', function(e) {
    e.preventDefault();
  });

  $('.set-editable[data-length]').on('keypress', function(e) {
    if (e.which !== 8 && e.which !== 37 && e.which !== 38 && e.which !== 39 && e.which !== 40) {
      // Limit name text size
      checkLength($(this), e);
    }
  }).on('paste', function(e) {
    // var paste = e.originalEvent.clipboardData.getData('Text');

    // if ((paste.length + $(this).text().length) >= $(this).data('length')) {
    //   var limit = $(this).data('length') - $(this).text().length;
    //   var pasteFinal = paste.substr(0, limit);
    //   $(this).append(pasteFinal);
    // }
    // checkLength($(this), e);
  }).on('drop', function(e) {
    e.preventDefault();
  });

  $('.set-editable.no-paste').on('paste', function(e) {
    e.preventDefault();
  }).on('drop', function(e) {
    e.preventDefault();
  });

  $('.set-editable.for-numbers').on('keypress', function(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  });

  // Placeholder
  var $placeholder = $('.set-editable[placeholder]');

  var clearPlaceHolder = function() {
    if ($(this).text().length === 0) {
      $(this).empty();
    }
  };

  $placeholder.on('keyup', clearPlaceHolder);
  $placeholder.on('click', clearPlaceHolder);
  $placeholder.on('change', clearPlaceHolder);
  $placeholder.bind('input', (clearPlaceHolder));

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
