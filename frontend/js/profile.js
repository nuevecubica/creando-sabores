$(document).ready(function() {

  // =============================
  // ========== Buttons events
  // =============================

  // ---------- Edit button: Activate mode-editor
  $('#edit.button-manage').on('click', function() {
    $('body').addClass('mode-editable');
    $('.set-editable').attr('contenteditable', true);

    var $name = $('#profile-name');
    var $about = $('#profile-about');
    if (!$name.data('origvalue')) {
      $name.data('origvalue', $name.html());
    }
    if (!$about.data('origvalue')) {
      $about.data('origvalue', $about.html());
    }
  });

  // ========== Save events
  // ---------- Update button: Save data user form (name, bio, photo)
  $('#update.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    // Can't do .text() directly to preserve newlines
    var about = $('#profile-about').contents().map(function() {
      return $(this).text();
    }).get().join('\n');

    // FormData not available in IE9, so we have to post a form
    $('#hidden-name').attr('value', $('#profile-name').text());
    $('#hidden-about').attr('value', about);

    $('#profile-form').submit();

  });

  // ---------- Save button: Save data account form (email, password...)
  $('#save').on('click', function(e) {
    $('#hidden-username').attr('value', $('#user-name input').val());
    $('#hidden-email').attr('value', $('#email input').val());
    $('#hidden-old-password').attr('value', $('#old-pass').val());
    $('#hidden-new-password').attr('value', $('#new-pass').val());
    $('#hidden-isPrivate').attr('value', $('#private input').is(':checked'));
    $('#hidden-receiveNewsletter').attr('value', $('#newsletter input').is(':checked'));

    $('#profile-change-form').submit();
  });

  // ---------- Cancel button: Restore profile fields (name, bio, photos)
  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    var $name = $('#profile-name');
    var $about = $('#profile-about');
    var $header = $('#profile-header-select');
    var $img = $('#profile-img-select');
    $name.html($name.data('origvalue'));
    $about.html($about.data('origvalue'));
    clearImages($header.get(0));
    $header.trigger('change');
    clearImages($img.get(0));
    $img.trigger('change');
  });

  // ---------- Change header image: Save data account form (email, password...)
  $('#profile-header-select').on('change', function(e) {
    setImagesPreview(e.target, $('#profile-header'), true);
  });

  // ---------- Change profile image: Save data account form (email, password...)
  $('#profile-img-select').on('change', function(e) {
    setImagesPreview(e.target, $('#profile-img'));
  });

  // ---------- Header and profile images preview
  var setImagesPreview = function(input, $target, warn) {
    var $warning = $('#image-size-warning');
    if (input.files.length === 0) {
      if ($target.data('origsrc')) {
        $target.css('background-image', $target.data('origsrc'));
        $('.default-bg').removeClass('selected-pic');
        if (warn) {
          $warning.css('display', $target.data('origdisplay'));
        }
      }
    }
    else {
      if (!$target.data('origsrc')) {
        $target.data('origsrc', $target.css('background-image'));
        if (warn) {
          $target.data('origdisplay', $warning.css('display'));
        }
      }
      var url = URL.createObjectURL(input.files[0]);
      $target.css('background-image', 'url(' + url + ')');
      $('.default-bg').addClass('selected-pic');
      // Min size detection
      if (warn) {
        var image = new Image();
        image.onload = function(evt) {
          if (evt.target.width < 1280 || evt.target.height < 800) {
            $warning.css('display', 'block');
          }
          else {
            $warning.css('display', 'none');
          }
        };
        image.src = url;
      }
    }
  };

  var clearImages = function(input) {
    try {
      input.value = null;
      $('.default-bg').removeClass('selected-pic');
    }
    catch (ex) {}
    if (input.value) {
      input.parentNode.replaceChild(input.cloneNode(true), input);
    }
  };

  // ---------- Show div change password
  $('.password .button').on('click', function(e) {
    var $passrow = $('#pass-row');
    if ($passrow.data('toggle')) {
      $passrow
        .slideUp()
        .data('toggle', false);
    }
    else {
      $passrow
        .slideDown()
        .data('toggle', true);
    }
    e.preventDefault();
  });

  // ========== Delete events
  //---------- Show popup delete account
  $('#delete-first').on('click', function(e) {
    $('#delete-confirm').toggleClass('visible');
    e.preventDefault();
  });

  //---------- Delete account
  $('#delete-confirm').on('click', function(e) {
    $('#profile-remove-form').submit();
  });

  // ========== Subsections
  var section = window.location.pathname.split('/')[2];

  /* global makePaginable */
  if (section === 'recetas') {
    makePaginable('/api/v1/me/recipes', 'recipes', 'recipe', '#recipes .list');
  }
  else if (section === 'favoritas') {
    makePaginable('/api/v1/me/favourites/list', 'recipes', 'recipe', '#recipes .list');
  }
  else if (section === 'compra') {
    makePaginable('/api/v1/me/shopping/list', 'recipes', 'recipe-shopping', '#shopping .list');
  }
  else if (section === 'tips') {
    makePaginable('/api/v1/me/tips/favourites/list', 'tips', 'tip', '#tips .list');
  }
  else if (section === 'menus') {
    makePaginable('/api/v1/me/menus', 'menus', 'menu', '#menus .list');
  }

  $('.checks:not(.all)').on('click', function() {
    var $this = $(this);
    $this.toggleClass('activated');
    var $container = $this.closest('.ingredients');
    var remaining = $container.find('.checks:not(.activated)').length;
    $container.find('.counter').html(remaining);
  });

  var removeClick = function() {
    var $this = $(this);
    var $container = $this.closest('.row.position');
    var slug = $container.data('slug');
    var url = '/api/v1/me/shopping/remove/' + slug;
    var jQXhr = $.ajax({
      url: url,
      type: 'GET',
      contentType: 'application/json',
      success: function(data) {
        if (!data.success) {
          var msg = 'Something went wrong!';
          console.log(msg);
          return;
        }
        $container.hide(400, function() {
          $container.remove();
        });
      }
    });
  };

  $('.shopping-remove').click(removeClick);
  $(document).bind('ajaxSuccess', function() {
    $('.shopping-remove').click(removeClick);
  });

  /* global Handlebars */
  $('.shopping-print').on('click', function() {
    var row = $(this).closest('.row.position');

    if ($('#print-this')) {
      $('#print-this').remove();
    }

    var item = {
      title: row.find('.ui.header').text(),
      text: 'Ingredientes',
      ingredients: row.find('.shopping-ingredients').html()
    };

    $.get('/templates/hbs/print-shopping-list.hbs').then(function(src) {
      var tpl = Handlebars.compile(src);
      console.log('TPL', tpl(item));
      $('body').append(tpl(item));

      window.print();
    });
  });

  $('.shopping-mail').on('click', function() {
    console.log('MAIL');

    var url = '/api/v1/me/shopping/send';

    var item = {
      title: row.find('.ui.header').text(),
      text: 'Ingredientes',
      ingredients: row.find('.shopping-ingredients').html()
    };

    var jQXhr = $.ajax({
      url: url,
      type: 'POST',
      data: item,
      contentType: 'application/json',
      success: function(data) {
        if (!data.success) {
          console.log('NO ENVIADO');
        }
        console.log('ENVIADO');
      }
    });
  });
});
