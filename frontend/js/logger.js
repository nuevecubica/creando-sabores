/**
 * Frontend logger
 * @param  {String}  level   Log level
 * @param  {String}  message Log description
 * @param  {Objct}   data    Object to stringify
 * @return {Boolean}         false
 */
var logger = function(level, message, data) {
  if (window.XMLHttpRequest) {
    var xhr = new XMLHttpRequest();

    data = data || {};
    data.message = message;
    data.browser = {
      'userAgent': window.navigator.userAgent,
      'screen': window.screen
    };
    xhr.open("POST", "/api/v1/log", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(data));
    return true;
  }
  return false;
};

/**
 * Global logger
 */
window.logger = logger;

/**
 * window.onerror handler
 */
window.onerror = function(message, url, line) {
  var data = {
    'url': url,
    'line': line
  };
  logger('error', message, data);
  return false;
};
