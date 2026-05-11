const test = require('node:test');
const assert = require('node:assert/strict');
const { hello } = require('./index.js');

test('hello with casual style', () => {
  assert.equal(hello('Alice', 'casual'), 'Hello, Alice!');
});

test('hello with formal style', () => {
  assert.equal(hello('Alice', 'formal'), 'Good day, Alice.');
});

test('hello with pirate style', () => {
  assert.equal(hello('Alice', 'pirate'), 'Ahoy, Alice!');
});

test('hello defaults name to world', () => {
  assert.equal(hello(), 'Hello, world!');
});

test('hello default style equals explicit casual', () => {
  assert.equal(hello('world'), hello('world', 'casual'));
});

test('hello throws TypeError for unknown style', () => {
  assert.throws(() => hello('Alice', 'yelling'), TypeError);
});
