$(document).ready(function() {

  /* global makePaginable */
  makePaginable('/api/v1/contestsPast', 'contest', '#past-contests');
});
