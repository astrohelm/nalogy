'use strict';

const Console = require('..')['nalogy/console'];
// const Browser = require('..')['nalogy/browser'];
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

// test('Browser transport', () => {
//   const transport = new Browser();
//   assert.strictEqual(typeof transport.write, 'function');
//   transport.write(undefined, { time: new Date(), msg: 'hello world', lvl: 'info' });
//   transport.write(undefined, { time: new Date(), msg: 'hello world', lvl: 'debug' });
//   transport.write(undefined, { time: new Date(), msg: 'hello world', lvl: 'warn' });
// });
