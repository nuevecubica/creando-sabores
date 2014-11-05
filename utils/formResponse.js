/**
 * formResponse
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {String}   url     Redirect
 * @param  {String}   error   Error message or true/false
 * @param  {String}   success Success message or true/false
 */
var formResponse = function(req, res, url, error, success) {
  if ('string' === typeof error) {
    req.flash('error', res.__(error));
  }
  else if ('string' === typeof success) {
    req.flash('success', res.__(success));
  }

  res.set('Api-Response-Error', error);
  res.set('Api-Response-Success', success);

  if ('function' === typeof url) {
    url();
  }
  else {
    if (null === url) {
      url = '..';
    }
    res.redirect(url);
  }
};

module.exports = exports = formResponse;
