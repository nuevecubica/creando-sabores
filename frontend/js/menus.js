/* global makePaginable */
$(window).on('load', function() {
  makePaginable('/api/v1/menus', 'menus', 'menu', '#menus .list');
});
