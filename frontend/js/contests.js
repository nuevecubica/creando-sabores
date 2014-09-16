$(document).ready(function() {

  /* global makePaginable */
  makePaginable('/api/v1/contests/past', 'contests', 'contest', '#past-contests');
});
