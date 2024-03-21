'use strict';

module.exports = Console;

const INVALID_OPTIONS = 'Invalid type of options parameter, must be an object';
const kOptions = Symbol('nalogy:console:options');
const OPTIONS = {
  pretty: log => log + '\n',
  stdout: process.stdout,
};

function Console(options = {}) {
  if (options === null || typeof options !== 'object') throw new Error(INVALID_OPTIONS);
  this[kOptions] = { ...OPTIONS, ...options };
}

Console.prototype.write = function (log) {
  const { pretty, stdout } = this[kOptions];
  stdout.write(pretty(log));
};
