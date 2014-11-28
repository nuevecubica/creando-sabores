$(document).ready(function() {

  /* global makePaginable, evtLoginRedirect */
  makePaginable('/api/v1/contests/past', 'contests', 'contest', '#past-contests');
  $('.join-contest').on('click', evtLoginRedirect);
});
