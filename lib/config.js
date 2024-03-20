'use strict';

const INVALID_OPTIONS = 'Invalid type of options parameter, must be an object';

// customLevels, useOnlyCustomLevels
// { foo: 23 }
// mixin, mergeStrategy
// let n = 0;
// (ctx, lvl, logger) => { return { line: ++n } }
// log { ... line: 1 }
// log { ... line: 2 }
// msgPrefix
// nestedKey
// silent, child
// redact
// sync (.write) / async (transfer by chunks)
// %o hello %s

module.exports = {
  INVALID_OPTIONS,

  OPTIONS: {
    depthLimit: 5,
    edgeLimit: 100,
    lvlComparison: 'ASC', // DESC
    level: 'info',
    transports: {
      lvl: 'info',
      target: 'nalogy/console',
      options: {},
    },
    base: {
      // pid: process.pid,
      // hostname: os.hostname,
      get timestamp() {
        return new Date().getTime();
      },
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
