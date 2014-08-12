$(document).ready(function() {

  $('.ui.dropdown').dropdown();

  $('#edit.button-manage').on('click', function() {

    $('body').addClass('mode-editable');
    $('.set-editable:not(.dropdown)').attr('contenteditable', true);

    var $title = $('#recipe-title');
    var $difficulty = $('#recipe-difficulty .itemSelected');
    var $time = $('#recipe-time');
    var $portions = $('#recipe-portions');
    var $description = $('#recipe-description');
    var $ingredients = $('#recipe-ingredients');
    var $procedure = $('#recipe-procedure');

    // Save original values for restore if user cancel edit
    if (!$title.data('origvalue')) {
      $title.data('origvalue', $title.html());
    }

    if (!$difficulty.data('origvalue')) {
      $difficulty.data('origvalue', $difficulty.html());
    }

    if (!$time.data('origvalue')) {
      $time.data('origvalue', $time.html());
    }

    if (!$portions.data('origvalue')) {
      $portions.data('origvalue', $portions.html());
    }

    if (!$description.data('origvalue')) {
      $description.data('origvalue', $description.html());
    }

    if (!$ingredients.data('origvalue')) {
      $ingredients.data('origvalue', $ingredients.html());
    }

    if (!$procedure.data('origvalue')) {
      $procedure.data('origvalue', $procedure.html());
    }

    $title.focus();
    //$title.selectRange($title.text().length);
    window.getSelection().setPosition(3);
  });

  $('#update.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    // Can't do .text() directly to preserve newlines
    var description = $('#recipe-description .set-editable').contents().map(function() {
      return $(this).text();
    }).get().join('\n');

    console.log($('#recipe-title').text());

    $('#hidden-title').attr('value', $('#recipe-title').text());
    $('#hidden-difficulty').attr('value', $('#recipe-difficulty .itemSelected .item').attr('data-value'));
    $('#hidden-time').attr('value', $('#recipe-time .span.set-editable').text());
    $('#hidden-portions').attr('value', $('#recipe-portions .span.set-editable').text());
    $('#hidden-description').attr('value', description);
    // $('#hidden-ingredients').attr('value', ingredients);
    // $('#hidden-procedure').attr('value', procedure);
    $('#recipe-form').submit();
  });

  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);

    var $title = $('#recipe-title');
    var $difficulty = $('#recipe-difficulty .itemSelected');
    var $time = $('#recipe-time');
    var $portions = $('#recipe-portions');
    var $description = $('#recipe-description');
    var $ingredients = $('#recipe-ingredients');
    var $procedure = $('#recipe-procedure');

    $title.html($title.data('origvalue'));
    $difficulty.html($difficulty.data('origvalue'));
    $time.html($time.data('origvalue'));
    $portions.html($portions.data('origvalue'));
    $description.html($description.data('origvalue'));
    $ingredients.html($ingredients.data('origvalue'));
    $procedure.html($procedure.data('origvalue'));

  });

  $('.set-editable.for.numbers').on('keypress', function(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  });

  $('.set-editable').on('focus', function(e) {

    $(this).removeClass('error-here');
  }).on('blur', function(e) {

    if ($(this).html() === '') {
      $(this).addClass('error-here');
    }
  });

  $('.time .set-editable').on('keyup', function(e) {
    if ($(this).html() > 120) {
      $(this).html('120');
      e.preventDefault();
    }
  });

  $('.portions .set-editable').on('keyup', function(e) {
    if ($(this).html() > 24) {
      $(this).html(24);
      e.preventDefault();
    }
  });

  $('#cancel.button-manage').on('click', function() {
    $('body').removeClass('mode-editable');
    $('.set-editable').attr('contenteditable', false);
  });

  $('.checks').on('click', function() {
    $(this).toggleClass('activated');
  });

  $('.checks.all').on('click', function() {
    console.log('click');
    $('#ingredients .checks').toggleClass('activated');
    $(this).toggleClass('activated');
  });

  var setPreview = function(input, $target) {
    if (input.files.length === 0) {
      if ($target.data('origsrc')) {
        $target.css('background-image', $target.data('origsrc'));
      }
    }
    else {
      if (!$target.data('origsrc')) {
        $target.data('origsrc', $target.css('background-image'));
      }
      var reader = new FileReader();
      reader.onload = function(event) {
        $target.css('background-image', 'url(' + event.target.result + ')');
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  var clearFile = function(input) {
    try {
      input.value = null;
    }
    catch (ex) {}
    if (input.value) {
      input.parentNode.replaceChild(input.cloneNode(true), input);
    }
  };

});
