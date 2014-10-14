exports = module.exports = function(url) {

  var proto = url.substring(0, url.indexOf('://'));
  var noproto = url.substring(url.indexOf('://') + 3);
  var host = noproto.substring(0, noproto.indexOf(':'));
  var port = noproto.substring(noproto.indexOf(':') + 1);

  return {
    proto: proto,
    host: host,
    port: port
  };
};
