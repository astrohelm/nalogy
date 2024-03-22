'use strict';

const MAX_DEPTH = 10;
const MAX_ITEMS = 100;
const ROOT_NAME = 'root';
const stringify = Stringify.bind({ maxItems: MAX_ITEMS, maxDepth: MAX_DEPTH, name: ROOT_NAME });

// prettier-ignore
/* eslint-disable consistent-return */
function Stringify(sample, key = this.name ?? 'root', stack = new WeakMap()) {
  var value = sample;
  const type = typeof sample;
  if (type === 'function' || type === 'symbol') return 'undefined';
  if ((type === 'number' && !Number.isFinite(value)) || value === null) return 'null';
  if (type !== 'object') return asString(String(value));
  if (stack.has(value)) return `"[Circular<${stack.get(value)}>]"`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (stack.length >= this.maxDepth) return '"[Array]"';
    stack.set(value, key);
    var length = Math.min(this.maxItems, value.length);
    for (var i = 0, res = ''; i < length; ++i) {
      res += Stringify.call(this, value[i], key + `[${i}]`, stack);
    }
    return '[' + res + ']';
  }

  const keys = Object.keys(value);
  if (keys.length === 0) return '{}';
  if (stack.length >= this.maxDepth) return '"[Object]"';
  stack.set(value, key);
  length = Math.min(this.maxItems, keys.length);
  var separator = res = '';
  for (i = 0; i < length; ++i) {
    var prop = keys[i];
    var val = Stringify.call(this, value[prop], key + `.${prop}`, stack);
    res += separator + asString(prop) + ':' + val;
    if (i === 0) separator = ',';
  }

  return '{' + res + '}';
}

const MAX_CHAR = 255;
const MAX_LENGTH = 100;
const DOUBLE_QUOTE = 34;
const BACKSLASH = 92;
const SPACE = 32;
function asString(str) {
  let result = '';
  let last = 0;
  let found = false;
  let point = MAX_CHAR;
  const l = str.length;
  if (l > MAX_LENGTH) return JSON.stringify(str);
  for (var i = 0; i < l && point >= SPACE; i++) {
    point = str.charCodeAt(i);
    if (point !== DOUBLE_QUOTE && point !== BACKSLASH) continue;
    result += str.slice(last, i) + '\\';
    last = i;
    found = true;
  }

  result = found ? result + str.slice(last) : str;
  return point < SPACE ? JSON.stringify(str) : '"' + result + '"';
}

function asJson(obj, prepare = stringify) {
  var json = '';

  for (var key in obj) {
    var value = obj[key];
    var type = typeof value;
    if (type === 'undefined' || type === 'function' || type === 'symbol') continue;
    if (type === 'number' && !Number.isFinite(value)) value = null;
    else value = prepare(value, key);
    json += ',' + asString(key) + ':' + value;
  }

  return json[1] === ',' ? json.slice(1) : json;
}

module.exports = { asJson, asString, stringify, Stringify };
