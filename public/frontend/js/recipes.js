$(document).ready(function() {

  var gridResizer = function() {
    $('#recipes-grid .recipe').each(function() {
      if ($(this).hasClass('medium')) {
        $(this).height($(this).width() / 2);
      }
      else {
        $(this).height($(this).width());
      }
    });
  };

  if ($('#recipes-grid')) {
    gridResizer();
    $(window).resize(gridResizer);
  }

});
