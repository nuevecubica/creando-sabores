// Everything globally available goes inside this object!
window.chef = {};

window.chef.errorMessages = {};
window.chef.errorMessage = function(errorId) {
  if (!chef.errorMessages) return 'Error';
  else return chef.errorMessages[errorId] ||  'Error';
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
