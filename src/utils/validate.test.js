const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isEmail, isUrl, isNonEmpty } = require('./validate');

// isEmail
test('isEmail() returns true for valid email', () => {
  assert.equal(isEmail('user@example.com'), true);
});

test('isEmail() returns true for email with subdomain', () => {
  assert.equal(isEmail('user@mail.example.co.uk'), true);
});

test('isEmail() returns false for string missing @', () => {
  assert.equal(isEmail('notanemail.com'), false);
});

test('isEmail() returns false for string missing domain', () => {
  assert.equal(isEmail('user@'), false);
});

test('isEmail() returns false for empty string', () => {
  assert.equal(isEmail(''), false);
});

test('isEmail() returns false for non-string input', () => {
  assert.equal(isEmail(null), false);
  assert.equal(isEmail(42), false);
  assert.equal(isEmail(undefined), false);
});

// isUrl
test('isUrl() returns true for http URL', () => {
  assert.equal(isUrl('http://example.com'), true);
});

test('isUrl() returns true for https URL', () => {
  assert.equal(isUrl('https://example.com/path?q=1'), true);
});

test('isUrl() returns false for ftp URL', () => {
  assert.equal(isUrl('ftp://example.com'), false);
});

test('isUrl() returns false for bare domain', () => {
  assert.equal(isUrl('example.com'), false);
});

test('isUrl() returns false for empty string', () => {
  assert.equal(isUrl(''), false);
});

test('isUrl() returns false for non-string input', () => {
  assert.equal(isUrl(null), false);
  assert.equal(isUrl(123), false);
});

// isNonEmpty
test('isNonEmpty() returns true for non-empty string', () => {
  assert.equal(isNonEmpty('hello'), true);
});

test('isNonEmpty() returns false for empty string', () => {
  assert.equal(isNonEmpty(''), false);
});

test('isNonEmpty() returns false for whitespace-only string', () => {
  assert.equal(isNonEmpty('   '), false);
});

test('isNonEmpty() returns false for non-string input', () => {
  assert.equal(isNonEmpty(null), false);
  assert.equal(isNonEmpty(0), false);
  assert.equal(isNonEmpty(undefined), false);
});

test('isNonEmpty() returns true for string with surrounding whitespace', () => {
  assert.equal(isNonEmpty('  hi  '), true);
});
