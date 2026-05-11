function formatMessage(level, message, context) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level}] ${message}`;
  return context !== undefined ? `${base} ${JSON.stringify(context)}` : base;
}

function error(message, context) {
  console.error(formatMessage('ERROR', message, context));
}

function warn(message, context) {
  console.warn(formatMessage('WARN', message, context));
}

function info(message, context) {
  console.log(formatMessage('INFO', message, context));
}

module.exports = { error, warn, info };
