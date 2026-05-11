function isEmail(value) {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

module.exports = { isEmail, isUrl, isNonEmpty };
