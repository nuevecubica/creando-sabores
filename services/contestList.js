var _ = require('underscore'),
  keystone = require('keystone'),
  async = require('async'),
  Contest = keystone.list('Contest'),
  service = require('./index'),
  queryMaker = require('./utils/listQueryMaker');

var getAllContests = function(options, callback) {

  options = _.defaults(options || {}, {
    sort: '-deadline',
    states: ['programmed', 'submission', 'votes', 'closed', 'finished']
  });

  var query = queryMaker(Contest, options);

  query.exec(callback || function() { /* dummy */ });
};

var getWithWinners = function(options, callback) {

  options = _.defaults(options || {}, {
    populate: ['awards.jury.winner', 'awards.community.winner'],
  });

  getAllContests(options, function(err, contests) {
    var populate2 = ['awards.jury.winner.author', 'awards.community.winner.author'];

    var populateContest = function(contest, done) {
      if (err || !contest || contest.state !== 'finished') {
        return done(err, contest); // Nothing to populate here.
      }
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
      }, function(err) {
        done(err, contest);
      });
    };

    if (options.one) {
      populateContest(contests, function(err, contest) {
        callback(err, contest);
      });
    }
    else {
      async.map(contests.results, populateContest, function(err, results) {
        contests.results = results;
        callback(err, contests);
      });
    }
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
