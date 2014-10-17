var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getAllContests = function(options, callback) {
  var own = false,
    data = {};

  options = _.defaults(options || {}, {
    sort: '-deadline',
    states: ['programmed', 'submission', 'votes', 'finished']
  });

  if (options.all) {
    options.states.push('review');
    options.states.push('removed');
  }

  var query = queryMaker(Contest, options);

  query.exec(callback || function() { /* dummy */ });
};

var getWithWinners = function(options, callback) {
  options = _.defaults(options || {}, {
    populate: ['awards.jury.winner', 'awards.community.winner'],
    states: ['finished']
  });
  getAllContests(options, function(err, contests) {
    var populate2 = ['awards.jury.winner.author', 'awards.community.winner.author'];
    async.map(contests.results, function(contest, done) {
      async.eachSeries(populate2, function(field, done) {
        Contest.model.populate(contest, {
          path: field,
          model: 'User'
        }, function(err, contestPopulated) {
          if (!err && contestPopulated) {
            contest = contestPopulated;
          }
          done(err);
        });
      }, done);
    }, function(err) {
      callback(err, contests);
    });
  });
};

/*
  Set exportable object
 */
var _service = {
  get: getAllContests,
  getWithWinners: getWithWinners
};

exports = module.exports = _service;
