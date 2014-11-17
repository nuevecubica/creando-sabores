var async = require('async'),
  os = require('os'),
  config = require(__base + 'config');

exports = module.exports = function(req, res) {
  var answer = {
    success: true,
    error: false,
    stats: {
      node: {
        uptime: process.uptime(),
        version: process.version,
        versions: process.versions,
        config: process.config,
        pid: process.pid,
        title: process.title,
        memoryUsage: process.memoryUsage(),
        env: process.env
      },

      hostname: os.hostname(),

      os: {
        type: os.type(),
        platform: os.platform(),
        release: os.release()
      },

      serverUptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),

      arch: os.arch(),
      cpus: os.cpus(),

      networkInterfaces: os.networkInterfaces(),

      tmpdir: os.tmpdir()
    }
  };

  return res.apiResponse(answer);
};
