'use strict';

const { access, constants, stat, rm, readFile } = require('node:fs').promises;
const FSLogger = require('../fslogger');
const assert = require('node:assert');
const { join } = require('node:path');
const test = require('node:test');
const { setTimeout: setTimer } = require('node:timers/promises');

const TIMEOUT = 1_000;
const WRITE_TIMEOUT = 300;

test('FSLogger transport', async () => {
  const location = join(__dirname, 'tmp');
  const fileLocation = join(__dirname, 'tmp', new Date().toLocaleDateString('af') + '.log');
  const transport = new FSLogger({ path: location, writeInterval: 100 });
  assert.strictEqual(typeof transport.write, 'function');
  assert.strictEqual(typeof transport.start, 'function');
  assert.strictEqual(typeof transport.finish, 'function');
  assert.strictEqual(location.endsWith('/tests/tmp'), true);
  transport.on('error', assert.fail);
  const timer = setTimeout(async () => {
    await transport.finish();
    await rm(location, { recursive: true, force: true }).catch(() => {});
  }, TIMEOUT);

  await transport.start();
  await access(location, constants.F_OK).catch(assert.fail);
  await access(fileLocation, constants.F_OK).catch(assert.fail);
  var stats = await stat(fileLocation);
  assert.strictEqual(stats.size, 0);

  transport.write('Hello world !');

  await setTimer(WRITE_TIMEOUT);

  stats = await stat(fileLocation);
  assert.strictEqual(stats.size > 0, true);

  const txt = await readFile(fileLocation);
  assert.strictEqual(txt.toString(), 'Hello world !\n');

  await transport.finish();
  await access(fileLocation, constants.F_OK)
    .then(assert.fail)
    .catch(() => {});

  clearTimeout(timer);
  await rm(location, { recursive: true, force: true }).catch(() => {});
});
