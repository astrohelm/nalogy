'use strict';

const { ROTATION_ERROR, DAY_IN_MS } = require('./config');
const { writeFileSync, promises } = require('node:fs');
const { join } = require('node:path');
const { readdir, unlink } = promises;

async function cleanup(transport, options) {
  if (!options.keep) return;
  const promises = [];
  try {
    var today = Date.now();
    var files = await readdir(options.path);
    for (var name of files) {
      if (!name.endsWith('.log')) continue;
      var date = new Date(name.substring(0, name.lastIndexOf('.'))).getTime();
      if ((today - date) / DAY_IN_MS < options.keep) continue;
      promises.push(unlink(join(options.path, name)));
    }
    await Promise.all(promises);
  } catch (err) {
    transport.emit('error', ROTATION_ERROR + err);
  }
}

function flushSync(path, buffer) {
  if (!buffer.length) return;
  const data = Buffer.concat(buffer.store);
  buffer.store.length = buffer.length = 0;
  writeFileSync(path, data, { flag: 'as' });
}

module.exports = { cleanup, flushSync };
