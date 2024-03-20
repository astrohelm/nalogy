'use strict';

const Console = require('../console');
const assert = require('node:assert');
const test = require('node:test');

test('Console transport', () => {
  const now = new Date().toISOString() + ' ';
  const pretty = log => now + log + '\n';

  const stdoutStab = {
    write: log => {
      assert.strictEqual(typeof log, 'string');
      assert.strictEqual(log, now + 'hello world\n');
    },
  };

  const transport = new Console({ stdout: stdoutStab, pretty });
  assert.strictEqual(typeof transport.write, 'function');
  transport.write('hello world');
});
