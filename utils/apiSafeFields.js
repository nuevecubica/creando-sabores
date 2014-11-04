var safe = {
  recipe: [
    'url', 'slug', 'title', 'description', 'ingredients', 'procedure',
    'portions', 'time', 'difficulty', 'rating', 'state',
    'createdDate', 'publishedDate', 'classes', 'type'
  ],
  user: ['slug', 'username', 'name', 'about', 'thumb', 'url'],
  me: ['slug', 'username', 'email', 'name', 'about', 'thumb', 'url', 'isPrivate'],
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
  tip: ['url', 'slug', 'title', 'tip']
};

safe.user.private = ['username', 'name', 'about', 'thumb', 'url'];

/*
Populated
 */
safe.recipe.populated = safe.recipe.concat([
  'author.name', 'author.about', 'author.username', 'author.thumb', 'author.url',
  'contest.id.slug', 'contest.id.url', 'contest.id.title', 'contest.id.description', 'contest.id.title',
  'contest.id.sponsor', 'contest.id.ingredientRequired', 'contest.id.submissionDeadline', 'contest.id.terms',
  'contest.id.state', 'contest.id.thumb', 'contest.id.type', 'contest.id.classes'
]);

safe.tip.populated = safe.tip.concat([
  'author.name', 'author.about', 'author.username', 'author.thumb', 'author.url'
]);

safe.question.populated = safe.question.concat(['author.username', 'author.name', 'author.thumb', 'author.url',
  'chef.username', 'chef.name', 'chef.thumb', 'chef.url'
]);

module.exports = exports = safe;
