$('.checks').on('click', function() {
  $(this).toggleClass('activated');
});

$('.checks.all').on('click', function() {
  console.log('click');
  $('#ingredients .checks').toggleClass('activated');
  $(this).toggleClass('activated');
});
