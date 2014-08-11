$(document).ready(function() {

  $('.ui.dropdown').dropdown();

  $('#edit.button-manage').on('click', function() {

    $('body').addClass('mode-editable');
    $('.set-editable:not(.dropdown)').attr('contenteditable', true);

    var $recipeDifficulty = $('#recipe-difficulty');
    var $recipeTime = $('#recipe-time');
    var $recipePortions = $('#recipe-time');

    if (!$recipeDifficulty.data('origvalue')) {
      $recipeDifficulty.data('origvalue', $recipeDifficulty.html());
    }

    if (!$recipeTime.data('origvalue')) {
      $recipeTime.data('origvalue', $recipeTime.html());
    }

    if (!$recipePortions.data('origvalue')) {
      $recipePortions.data('origvalue', $recipePortions.html());
    }
  });

  $('.set-editable').on('keypress', function(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      e.preventDefault();
    }
  }).on('focus', function(e) {

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

});
