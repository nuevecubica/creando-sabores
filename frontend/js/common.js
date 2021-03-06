// Everything globally available goes inside this object!
var chef = window.chef;

chef.errorMessages = chef.errorMessages || {};
chef.errorMessage = function(errorId) {
  if (!chef.errorMessages) {
    return 'Error';
  }
  else {
    return chef.errorMessages[errorId] || 'Error';
  }
};


// --- Login/register modal ---

var showAuthModal = function(section, next, noPush) {
  if (!section) {
    section = 'login';
  }
  if (!next) {
    next = window.location.pathname;
  }
  $('#modal-bg').removeClass('hidden');
  $('#modal-fg').attr('data-section', section);

  $('#modal-fg form').each(function(i, a) {
    var action = $(a).attr('action');
    action = action ? action.split('?')[0] : '';
    $(a).attr('action', action + '?next=' + encodeURIComponent(next));
  });
  $('.buttons-social a').each(function(i, a) {
    var href = $(a).attr('href');
    href = href ? href.split('?')[0] : '';
    $(a).attr('href', href + '?next=' + encodeURIComponent(next));
  });

  if (history.pushState && !noPush) {
    history.pushState({
      modal: true,
      section: section,
      next: next
    }, '', '');
  }
};

var hideAuthModal = function() {
  $('#modal-bg').addClass('hidden');
  history.replaceState({
    modal: false
  }, '', '');
};

window.onpopstate = function(e) {
  if (!e.state || !e.state.modal) {
    hideAuthModal();
  }
  else {
    showAuthModal(e.state.section, e.state.next, true);
  }
};


var evtLoginRedirect = function(e) {
  if (!window.chef.isUserLoggedIn) {
    showAuthModal('login', $(this).attr('href'));
    e.preventDefault();
  }
};

$(document).ready(function() {

  $('#modal-bg').on('click', hideAuthModal);
  $('#modal-fg').on('click', function(e) {
    e.stopPropagation();
  });

  $(document).keydown(function(e) {
    if (e.keyCode === 27 && !$('#modal-bg').hasClass('hidden')) {
      hideAuthModal();
    }
  });

  var evtLogin = function(e) {
    e.preventDefault();
    showAuthModal();
  };

  var evtSignup = function(e) {
    e.preventDefault();
    showAuthModal('signup');
  };


  $('a:not(.no-modal)[href="/acceso"]').on('click', evtLogin);
  $('a:not(.no-modal)[href="/registro"]').on('click', evtSignup);
  $('a[href="/nueva-receta"]').on('click', evtLoginRedirect);
  $('a[href="/nuevo-menu"]').on('click', evtLoginRedirect);
});

// --- Misc ---

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

$(window).on('load', function() {
  $('body').removeClass('preload');
  $('.error-here:visible').transition('bounce');
});

var messageRemove = function(item) {
  var $item = $(item);
  $item.transition({
    animation: 'fade down',
    complete: function() {
      $item.remove();
    }
  });
};

$(document).ready(function() {

  // Menu
  $('.demo.menu .item').tab();

  $('#menu').on('click', function() {
    $('#menu-box').addClass('open').removeClass('close');
  });

  $('#menu-close').on('click', function() {
    $('#menu-box').removeClass('open').addClass('close');
  });

  $(document).on('click', '.messages-close', function() {
    messageRemove(this.parentNode);
  });

  $('.message').each(function(i, a) {
    setTimeout(function() {
      messageRemove(a);
    }, 3 * 1000);
  });

  // Grid
  var gridResizer = function() {
    var height = $('.wall .recipe.small:visible, .wall .contest.small:visible, .wall .tip.small:visible, .wall .menu.small:visible').eq(0).width();

    $('.wall .recipe, .wall .contest, .wall .tip, .wall .menu').each(function() {
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
    $(window).on('resize', gridResizer);
    $(window).on('load', gridResizer);
  }

  $('.social-popup').on('click', function(evt) {
    var attr = 'height=450,width=500';
    attr += ',status=no,toolbar=no,menubar=no,scrollbars=no';
    attr += ',location=no,directories=no';
    window.open($(this).attr('href'), '', attr);
    evt.preventDefault();
  });

  $(document).on('click', function() {
    $('#contextual-menu').toggleClass('hidden', true);
  });

  $('#menu-wrapper .profile').on('click', function(e) {
    e.stopPropagation();
    $('#contextual-menu').toggleClass('hidden');
  });

  $('#contextual-menu').on('click', function(e) {
    e.stopPropagation();
  });
});

var flashMessage = function(msg, type) {
  if (!type) {
    type = 'error';
  }

  var $m = $('#messages');
  if (!$m.length) {
    var code = '<div id="messages" class="ui grid segment">';
    code += '<div class="ui page grid">';
    code += '<div class="row messages">';
    code += '<div class="aligned center column">';
    $m = $(code).prependTo(document.body);
  }
  $m = $('.column', $m);
  var $new = $('<div class="ui message error-here">');
  $new.addClass(type);
  $new.append(msg);
  $new.append($('<i class="icon icon-chef-cross messages-close">'));
  $m.append($new);

  $new.transition('bounce');
  setTimeout(function() {
    messageRemove($new);
  }, 3 * 1000);
};

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

/* global Handlebars */
function getTemplate(name, items, callback) {
  return $.get('/templates/hbs/' + name + '.hbs').then(function(src) {
    callback(Handlebars.compile(src), items);
  });
}

// Enable pagination on the current page
var makePaginable = function(endpoint, retproperty, hbsname, appendable, extraargs) {

  if (chef.clearPaginable) {
    chef.clearPaginable();
  }

  var timeCheckScroll = null,
    counter = 2,
    isStillOnScreen = false,
    isWorking = false,
    args = {
      page: 2,
      perPage: 5
    };
  if (extraargs) {
    for (var key in extraargs) {
      if (extraargs.hasOwnProperty(key)) {
        args[key] = extraargs[key];
      }
    }
  }

  var handleLoadClick = function(e) {
    e.preventDefault();
    getNextPage();
  };

  var handleScroll = function() {
    clearTimeout(timeCheckScroll);

    timeCheckScroll = setTimeout(function() {
      checkScroll();
    }, 50);
  };

  $(document).on('click', '.load-button', handleLoadClick);
  $(window).on('scroll', handleScroll);
  chef.clearPaginable = function() {
    $(document).off('click', '.load-button', handleLoadClick);
    $(window).off('scroll', handleScroll);
  };

  var checkScroll = function() {
    var isLoaderOnScreen;
    try {
      isLoaderOnScreen = $('.loader').isOnScreen();
    }
    catch (e) {
      return;
    }

    if (isLoaderOnScreen && !isStillOnScreen && args.page) {

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
    if (isWorking) {
      return;
    }
    else {
      isWorking = true;
    }
    var url = endpoint + '?' + $.param(args);

    var jQXhr = $.getJSON(url).done(function(data) {

        var items, startPos, next;
        if (typeof(retproperty) === 'function') {
          var t = retproperty(data, args);
          items = t.results;
          startPos = t.first;
          next = t.next;
        }
        else {
          if (!data[retproperty]) {
            $('.loader > .column').removeClass('show');
            return;
          }
          items = data[retproperty].results;
          startPos = data[retproperty].first;
          next = data[retproperty].next;
        }

        getTemplate(hbsname, items, function(tpl, items) {
          var html = '';

          for (var i = 0, l = items.length; i < l; i++) {
            items[i]['i'] = startPos + i;
            html += tpl(items[i]);
          }

          $(html).css('display', 'none').appendTo(appendable).slideDown('slow', function() {
            // Is loader on screen after append recipes?
            //isStillOnScreen = $('.loader').isOnScreen();
            isStillOnScreen = false; // Always load more if needed...
          });

          // hidden all messages
          $('.loader > .column').removeClass('show');
        });

        counter--;
        if (next) {
          args.page = next;
        }
        else {
          args.page = null;
        }
        isWorking = false;
      })
      .fail(function() {
        console.log('error');

        setTimeout(function() {
          getNextPage();
        }, 3000);
      });
  };

};

var ratingClick = function(type, target) {
  if (!window.chef.isUserLoggedIn) {
    showAuthModal();
    return;
  }
  if (window.chef.user.isUnconfirmed) {
    flashMessage(window.chef.errorMessage('Unconfirmed user'));
    return;
  }

  var $this = $(target);
  var $rating = $this.closest('.rating');
  var slug = $rating.data('slug');
  var score = $('i.icon-chef-star.icon.active').length;

  console.log('SLUG ', slug);
  console.log('SCORE', score);

  $rating.data('lock', true);
  var url = '/api/v1/' + type + '/' + slug + '/vote/' + score;
  var jQXhr = $.ajax({
    url: url,
    type: 'PUT',
    contentType: 'application/json',
    success: function(data) {
      if (!data.success) {
        var msg = 'Something went wrong!';
        if (data.details) {
          msg += ' Reason: ' + data.details;
        }
        console.log(msg);
        flashMessage(window.chef.errorMessage('Unknown error'));
        return;
      }
      var $value = $rating.find('.rating-value');
      $value.html(data.rating.toFixed(2).replace(/[.,]00$/, ""));

      var value = Math.floor(data.rating);
      var $stars = $('i.icon-chef-star.icon');
      $stars.removeClass('active');

      for (var i = 0; i < value; i++) {
        $stars.eq(i).addClass('active');
      }

    }
  });
};

var likeClick = function(e) {
  if (!window.chef.isUserLoggedIn) {
    showAuthModal();
    return;
  }
  if (window.chef.user.isUnconfirmed) {
    flashMessage(window.chef.errorMessage('Unconfirmed user'));
    return;
  }

  var $this = $(this);
  var $rating = $this.closest('.rating');
  var slug = $rating.data('slug');
  var action = $rating.hasClass('liked') ? 'unlike' : 'like';
  if ($rating.data('lock')) {
    return;
  }
  $rating.data('lock', true);
  var url = '/api/v1/recipe/' + slug + '/' + action;
  var jQXhr = $.ajax({
    url: url,
    type: 'PUT',
    contentType: 'application/json',
    success: function(data) {
      if (!data.success) {
        var msg = 'Something went wrong!';
        if (data.details) {
          msg += ' Reason: ' + data.details;
        }
        console.log(msg);
        $rating.data('lock', null);
        flashMessage(window.chef.errorMessage('Unknown error'));
        return;
      }
      var $counter = $rating.find('.like-counter');
      $counter.html(data.likes);
      $rating.toggleClass('liked', action === 'like');
      $rating.data('lock', null);
    }
  });
  e.preventDefault();
};


// -- Image resizing --
var canvasResizeAvailable = function() {
  return (!!window.HTMLCanvasElement && new XMLHttpRequest().upload && window.FormData);
};

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function(callback, type, quality) {
      var binStr = atob(this.toDataURL(type, quality).split(',')[1]),
        len = binStr.length,
        arr = new Uint8Array(len);
      for (var i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
      }
      callback(new Blob([arr], {
        type: type || 'image/png'
      }));
    }
  });
}

var imageScaleBlob = function(file, callback, maxWidth, maxHeight) {
  var mw = maxWidth || 1920,
    mh = maxHeight || 800,
    img = document.createElement("img"),
    reader = new FileReader();

  reader.onload = function(e) {
    img.src = e.target.result;
    var iw = img.width,
      ih = img.height;
    if (iw <= mw || ih <= mh) {
      // File is small already. Don't resize it.
      return callback(file);
    }

    // Downscale it to cover our max size, no cropping
    var r = Math.max(mw / iw, mh / ih),
      nw = iw * r,
      nh = ih * r,
      canvas = document.createElement('canvas');
    canvas.width = nw;
    canvas.height = nh;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, iw, ih, 0, 0, nw, nh);
    canvas.toBlob(callback, 'image/jpeg', 0.95);
  };
  reader.readAsDataURL(file);
};

// -- AJAX form submission --
// Fabulous AJAX submission with image scaling if needed
var ajaxSubmit = function(form, failcb) {

  var loadingWrapper = document.createElement('div');
  loadingWrapper.id = 'loading-wrapper';
  var loading = document.createElement('div');
  loading.id = 'loading';
  loadingWrapper.appendChild(loading);
  document.body.insertBefore(loadingWrapper, document.body.firstChild);

  failcb = failcb || function() {};

  var formData = new FormData();
  formData.append('noRedir', true);

  var complete = function() {
    var request = new XMLHttpRequest();
    request.open('POST', form.action);
    request.onload = function(e) {
      var dest = request.getResponseHeader('Api-Response-Location');
      if (dest) {
        if (dest[0] === '.') {
          dest = form.action + '/' + dest; // Relativize to old endpoint
        }
        document.location.href = dest;
      }
      else {
        flashMessage(window.chef.errorMessage('Error saving'));
        document.body.removeChild(loadingWrapper);
        failcb();
      }
    };
    request.onerror = function(e) {
      flashMessage(window.chef.errorMessage('Error saving'));
      document.body.removeChild(loadingWrapper);
      failcb();
    };
    request.send(formData);
  };

  var elements = [];
  for (var i = 0, l = form.elements.length; i < l; i++) {
    elements.push(form.elements[i]);
  }

  var step = function() {
    if (!elements.length) {
      return complete();
    }
    var element = elements.shift();
    if (element.type !== 'file') {
      formData.append(element.name, element.value);
      step();
    }
    else if (element.files.length) {
      imageScaleBlob(element.files[0], function(blob) {
        formData.append(element.name, blob, element.files[0].fileName);
        step();
      });
    }
    else {
      step();
    }
  };

  step();
};


// -- Image preview for header editing --
var clearFile = function(input) {
  if (input) {
    try {
      input.value = null;
    }
    catch (ex) {}
    if (input.value) {
      input.parentNode.replaceChild(input.cloneNode(true), input);
    }
  }
};

var setHeaderPreview = function(input) {
  var $target = $('#header-background');
  var $targetV = $('#vertical-overlay');
  var $warning = $('#image-size-warning');
  if (input.files.length === 0) {
    if ($target.data('origsrc')) {
      $target.css('background-image', $target.data('origsrc'));
      $target.toggleClass('blur', $target.data('blur'));
      $warning.css('display', $target.data('origdisplay'));
      $targetV.css('background-image', $targetV.data('origsrc'));
    }
  }
  else {
    // File size check
    if (input.files[0].size > window.chef.editor.config.recipe.image.length) {
      if (!canvasResizeAvailable()) {
        // User browser doesn't allow for auto-resizing, and file is too big.
        // Bail out!
        flashMessage(window.chef.errorMessage('File too big'));
        clearFile(input);
        setHeaderPreview(input, $target, $targetV);
        return;
      }
    }
    if (!$target.data('origsrc')) {
      $target.data('origsrc', $target.css('background-image'));
      $target.data('blur', $target.hasClass('blur'));
      $target.data('origdisplay', $warning.css('display'));
      $targetV.data('origsrc', $targetV.css('background-image'));
    }
    var url = URL.createObjectURL(input.files[0]);
    $target.css('background-image', 'url(' + url + ')');
    // Min size detection
    var image = new Image();
    image.onload = function(evt) {
      if (evt.target.width < 1280 || evt.target.height < 800) {
        $warning.css('display', 'block');
      }
      else {
        $warning.css('display', 'none');
      }
      if (evt.target.height >= evt.target.width) {
        $target.toggleClass('blur', true);
        $targetV.css('background-image', 'url(' + url + ')');
      }
      else {
        $target.toggleClass('blur', false);
        $targetV.css('background-image', 'none');
      }
    };
    image.src = url;
  }
};
