'use strict';

const { join } = require('path');

module.exports = {
  INVALID_OPTIONS: 'Invalid type of options parameter, must be an object',
  INVALID_DIRECTORY: 'Can not create directory: ',
  ROTATION_ERROR: 'Error wile rotating the file: ',
  STREAM_ERROR: 'Log file is not writable: ',

  OPTIONS: {
    path: join(__dirname, './logs'),
    bufferSize: 64 * 1_024,
    writeInterval: 3_000,
    silence: false,
    locale: 'af',
    crlf: false,
    keep: 3,
  },

  PROMISE_TO_BOOL: [() => true, () => false],
  STREAM_OPTIONS: { flags: 'a' },
  DAY_IN_MS: 1000 * 60 * 60 * 24,
  STAB_FUNCTION: () => false,
};
