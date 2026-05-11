const STYLES = {
  casual: (name) => `Hey, ${name}!`,
  formal: (name) => `Good day, ${name}.`,
  pirate: (name) => `Ahoy, ${name}! Arr!`,
};

export function hello(name = "world", style = "casual") {
  const greet = STYLES[style] ?? STYLES.casual;
  return greet(name);
}
