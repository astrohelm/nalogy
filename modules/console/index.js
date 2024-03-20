'use strict';

module.exports = Console;

const kOptions = Symbol('nalogy:console:options');
const OPTIONS = {
  pretty: log => log + '\n',
  stdout: process.stdout,
};

function Console(options = {}) {
  this[kOptions] = { ...OPTIONS, ...options };
}

Console.prototype.write = function (log) {
  const { pretty, stdout } = this[kOptions];
  stdout.write(pretty(log));
};
