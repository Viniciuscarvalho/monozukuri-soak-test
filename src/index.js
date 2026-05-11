const STYLES = Object.freeze({
  casual: (name) => `Hello, ${name}!`,
  formal: (name) => `Good day, ${name}.`,
  pirate: (name) => `Ahoy, ${name}!`,
});

function hello(name = 'world', style = 'casual') {
  if (!Object.prototype.hasOwnProperty.call(STYLES, style)) {
    throw new TypeError(
      `Unknown style "${style}". Valid styles: ${Object.keys(STYLES).join(', ')}`
    );
  }
  return STYLES[style](name);
}

module.exports = { hello };
