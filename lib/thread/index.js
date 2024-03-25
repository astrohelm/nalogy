'use strict';

const { EventEmitter } = require('events');
const { R_INDEX, W_INDEX } = require('./indexes');

function createWorker(stream, opts) {}

const INVALID_BUFFER_SIZE = 'Buffersize must be at least of size 4-byte utf-8 characters';
module.exports = class ThreadStream extends EventEmitter {
  #worker;

  constructor(options) {
    super();
    if (options.bufferSize < 4) throw new Error(INVALID_BUFFER_SIZE);
    this.#worker = createWorker(this, options);
  }

  write(data) {}
  end() {}
  flush() {}
  flushSync() {}

  ref() {
    this.#worker.ref();
  }

  unref() {
    this.#worker.unref();
  }
};

function write(stream, data, cb) {
  const current = Atomics.load(stream.#state);
  const length = Buffer.byteLength(data);
  Atomics.store();
  Atomics.notify();
  return cb(), true;
}

function flyshSync(stream)
