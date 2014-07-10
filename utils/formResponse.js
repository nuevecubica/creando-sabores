var formResponse = function(res, req, url, error, success) {
  if ('string' === typeof error) {
    req.flash('error', error);
  }
  else if ('string' === typeof success) {
    req.flash('success', success);
  }

  if (null === url) {
    url = '..';
  }

  res.set('Api-Response-Error', error);
  res.set('Api-Response-Success', success);
  res.redirect(url);
};

module.exports = exports = formResponse;
