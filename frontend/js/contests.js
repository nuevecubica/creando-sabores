$(document).ready(function() {

  /* global makePaginable */
  makePaginable('/api/v1/contestsPast', 'contests', 'contest', '#past-contests');
});
