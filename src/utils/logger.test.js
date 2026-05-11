const { test } = require('node:test');
const assert = require('node:assert/strict');
const { error, warn, info } = require('./logger');

function captureConsole(method, fn) {
  const calls = [];
  const original = console[method];
  console[method] = (...args) => calls.push(args.join(' '));
  fn();
  console[method] = original;
  return calls;
}

test('info() outputs message with ISO timestamp and INFO level', () => {
  const calls = captureConsole('log', () => info('hello'));
  assert.equal(calls.length, 1);
  assert.match(calls[0], /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] hello$/);
});

test('warn() outputs message with WARN level to console.warn', () => {
  const calls = captureConsole('warn', () => warn('something off'));
  assert.equal(calls.length, 1);
  assert.match(calls[0], /\[WARN\] something off$/);
});

test('error() outputs message with ERROR level to console.error', () => {
  const calls = captureConsole('error', () => error('broke'));
  assert.equal(calls.length, 1);
  assert.match(calls[0], /\[ERROR\] broke$/);
});

test('info() includes serialized context object when provided', () => {
  const calls = captureConsole('log', () => info('loaded', { userId: 42 }));
  assert.equal(calls.length, 1);
  assert.match(calls[0], /\[INFO\] loaded \{"userId":42\}/);
});

test('error() works without context argument', () => {
  const calls = captureConsole('error', () => error('plain error'));
  assert.equal(calls.length, 1);
  assert.doesNotMatch(calls[0], /undefined/);
});
