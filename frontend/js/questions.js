$(document).ready(function() {

  /* global makePaginable */
  makePaginable('/api/v1/questions', 'questions', 'question', '#questions .list');
});
