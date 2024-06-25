const sampleConfig = require('../config.js');

/**
 * 
 * @param {Express.Request} req  
 * @param {string} level @see https://cloud.google.com/logging/docs/reference/v2/rpc/google.logging.type#google.logging.type.LogSeverity
 * @param {string} message
 */
function log(req, level, message) {
  const logEntry = {};
  logEntry["logging.googleapis.com/labels"] = {};

  logEntry["severity"] = level;
  logEntry["message"] = message;

  if (req.get("X-Cloud-Trace-Context")) {
    const traceContext = req.get("X-Cloud-Trace-Context").match(/([a-zA-Z0-9]+)\/([0-9]+)/);
    if (traceContext.length >= 3) {
      logEntry["logging.googleapis.com/trace"] = "projects/" + sampleConfig.webServer.google.projectId + "/traces/" + traceContext[1];
      logEntry["logging.googleapis.com/spanId"] = traceContext[2];
      logEntry["logging.googleapis.com/trace_sampled"] = true;
    }
  }

  if (req.userContext && req.userContext.userinfo) {
    logEntry["logging.googleapis.com/labels"]["userSub"] = req.userContext.userinfo.sub;
    logEntry["logging.googleapis.com/labels"]["userName"] = req.userContext.userinfo.name;
  }

  console.log(JSON.stringify(logEntry));
}

function debug(req, message) {
  log(req, 'DEBUG', message);
}
function info(req, message) {
  log(req, 'INFO', message);
}
function warn(req, message) {
  log(req, 'WARNING', message);
}
function error(req, message) {
  log(req, 'ERROR', message);
}

module.exports = {
  debug: debug,
  info: info,
  warn: warn,
  error: error,
}
