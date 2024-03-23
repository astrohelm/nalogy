'use strict';

const { isBrowser, isNode } = require('./utils');
const BASE = { time: () => Date.now(), host: isBrowser() ? 'browser' : require('os').hostname() };
const INVALID_OPTIONS = 'Invalid type of options parameter, must be an object';

if (isNode()) BASE.pid = process.pid;

// redact
// sync (.write) / async (transfer by chunks) (worker)
// %o hello %s
module.exports = {
  INVALID_OPTIONS,

  OPTIONS: {
    depthLimit: 5,
    itemsLimit: 100,
    customLevels: null,
    useOnlyCustomLevels: false,
    serializers: null, //
    level: 'info',
    base: BASE, //
    transports: {
      lvl: 'info',
      target: 'nalogy/console',
      options: {},
    },
  },

  LEVELS: {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
    silent: Infinity,
  },
};
