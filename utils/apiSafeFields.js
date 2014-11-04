var safe = {
  recipe: [
    'url', 'slug', 'title', 'description', 'ingredients', 'procedure',
    'portions', 'time', 'difficulty', 'rating', 'state',
    'createdDate', 'publishedDate', 'classes'
  ],
  user: ['slug', 'username', 'name', 'about', 'thumb', 'url'],
  question: [
    'url', 'slug', 'title', 'answer',
    'state', 'createdDate', 'publishedDate',
    'classes'
  ],
  contest: [
    'url', 'slug', 'title', 'description', 'title', 'sponsor',
    'ingredientRequired', 'submissionDeadline', 'terms',
    'state', 'thumb', 'type', 'classes', 'awards.jury.winner',
    'awards.community.winner'
  ],
  tip: ['url', 'title', 'tip']
};

safe.user.private = ['username', 'name', 'about', 'thumb', 'url'];

/*
Populated
 */
safe.recipe.populated = safe.recipe.concat([
  'author.name', 'author.about', 'author.username', 'author.thumb', 'author.url',
  'contest.url', 'contest.title', 'contest.description', 'contest.title', 'contest.sponsor',
  'contest.ingredientRequired', 'contest.submissionDeadline', 'contest.terms',
  'contest.state', 'contest.thumb', 'contest.type', 'contest.classes'
]);

safe.tip.populated = safe.tip.concat([
  'author.name', 'author.about', 'author.username', 'author.thumb', 'author.url'
]);

safe.question.populated = safe.question.concat(['author.username', 'author.name', 'author.thumb', 'author.url',
  'chef.username', 'chef.name', 'chef.thumb', 'chef.url'
]);

module.exports = exports = safe;
