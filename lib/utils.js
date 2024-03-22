'use strict';

function stringify(obj) {
  try {
    return JSON.stringify(obj);
  } catch {}
}

function asString(str) {
  let result = '';
  let last = 0;
  let found = false;
  let point = 255;
  const l = str.length;
  if (l > 100) return JSON.stringify(str);
  for (var i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i);
    if (point !== 34 && point !== 92) continue;
    result += str.slice(last, i) + '\\';
    last = i;
    found = true;
  }

  result = found ? result + str.slice(last) : str;
  return point < 32 ? JSON.stringify(str) : '"' + result + '"';
}

function asJson(obj) {
  var json = '';

  for (var key in obj) {
    var value = obj[key];
    var type = typeof value;
    if (type === 'undefined' || type === 'function') continue;
    if (type === 'number' && !Number.isFinite(value)) value = null;
    else value = stringify(value);
    json += ',' + asString(key) + ':' + value;
  }

  return json[1] === ',' ? json.slice(1) : json;
}

module.exports = { asJson };
