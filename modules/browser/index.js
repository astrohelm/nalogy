'use strict';

const DEFAULT_COLOR = '#6666ff';
const DEFAULT_METHOD = console.log;
const DEFAULT_BIND = { method: DEFAULT_METHOD, color: DEFAULT_COLOR };
const { format: timeFormat } = new Intl.DateTimeFormat(); //? Bro language
module.exports = Browser;

// prettier-ignore
const BINDINGS = {
  info:  { method:  console.info ?? DEFAULT_METHOD, color: '#659AD2' },
  warn:  { method:  console.warn ?? DEFAULT_METHOD, color: '#F9C749' },
  debug: { method: console.debug ?? DEFAULT_METHOD, color: '#9AA2AA' },
  error: { method: console.error ?? DEFAULT_METHOD, color: '#EC3D47' },
  trace: { method: console.trace ?? DEFAULT_METHOD, color: '#F9C749' },
  fatal: { method: console.error ?? DEFAULT_METHOD, color: '#EC3D47' },
};

function Browser() {}
Browser.prototype.write = function (_, { lvl, time, msg = '', ...other }) {
  const { color, method } = BINDINGS[lvl] ?? DEFAULT_BIND;
  const format = `[${timeFormat(time ?? Date.now())}] %c${lvl.toUpperCase()}:`;
  method(format, color, msg, JSON.stringify(other, null, 2).slice(1, -1));
};
