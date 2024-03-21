'use strict';

const { INVALID_OPTIONS, INVALID_DIRECTORY, STREAM_ERROR, ROTATION_ERROR } = require('./config');
const { OPTIONS, STREAM_OPTIONS, DAY_IN_MS, STAB_FUNCTION } = require('./config');

const { createWriteStream, promises: fsp } = require('node:fs');
const { EventEmitter } = require('node:events');
const { stat, mkdir, readdir, unlink } = fsp;
const { join } = require('node:path');

const PROMISE_TO_BOOL = [() => true, () => false];

module.exports = class FSLogger extends EventEmitter {
  #buffer = { length: 0, store: [] };
  #active = false;
  #options = null;
  #stream = null;
  #lock = null;
  #location = '';
  #file = '';

  #switchTimer = null;
  #flushTimer = null;

  //? Only this method can throw exceptions
  constructor(options = {}) {
    super();
    if (options === null || typeof options !== 'object') throw new Error(INVALID_OPTIONS);
    this.#options = { ...OPTIONS, ...options };
    if (!this.#options.silence) return;
    const emit = this.emit.bind(this);
    this.emit = (event, ...args) => {
      if (event === 'error') return this;
      return emit(event, ...args);
    };
  }

  async start() {
    if (this.#active) return this;
    const path = this.#options.path;
    var isExist = await stat(path)
      .then(v => v.isDirectory())
      .catch(STAB_FUNCTION);

    if (!isExist) isExist = await mkdir(path).then(...PROMISE_TO_BOOL);
    if (!isExist) throw new Error(INVALID_DIRECTORY + path);
    await this.#open();
    return this;
  }

  async finish() {
    if (!(this.#active && this.#stream)) return;
    if (this.#stream.destroyed || this.#stream.closed) return;
    await this.#flush();
    this.#active = false;
    this.#switchTimer = (clearTimeout(this.#switchTimer), null);
    this.#flushTimer = (clearTimeout(this.#flushTimer), null);
    await stat(this.#location)
      .then(({ size }) => !size && unlink(this.#location).catch(STAB_FUNCTION))
      .catch(STAB_FUNCTION);
  }

  write(log) {
    this.#buffer.store.push(Buffer.from(log + '\n'));
    this.#buffer.length += log.length;
    this.#buffer.length > this.#options.bufferSize && this.flush();
  }

  async #open() {
    this.#file = new Date().toLocaleDateString(this.#options.locale) + '.log';
    this.#location = join(this.#options.path, this.#file);
    await this.#rotate();

    const error = await new Promise(resolve => {
      const signal = () => resolve(STREAM_ERROR + this.#file);
      this.#stream = createWriteStream(this.#location, STREAM_OPTIONS);
      this.#stream.on('error', () => this.emit(STREAM_ERROR + this.#file));
      this.#stream.once('open', () => {
        this.#stream.off('error', signal);
        resolve();
      });
    });

    if (error) return void this.#stream.destroy();
    const today = new Date();
    const tm = -today.getTime() + today.setUTCHours(0, 0, 0, 0) + DAY_IN_MS;

    this.#active = true;
    this.#flushTimer = setInterval(() => this.#flush(), this.#options.writeInterval);
    this.#switchTimer = setTimeout(() => this.finish().then(() => this.#open()), tm);
  }

  async #flush() {
    if (this.#lock) await this.#lock;
    if (!this.#buffer.length) return Promise.resolve();
    const buffer = Buffer.concat(this.#buffer.store);
    this.#buffer.store.length = this.#buffer.length = 0;
    this.#lock = new Promise(res => void this.#stream.write(buffer, res));
    return this.#lock;
  }

  async #rotate() {
    if (!this.#options.keep) return;
    const promises = [];
    try {
      var today = new Date().getTime();
      var files = await readdir(this.#options.path);
      for (var name of files) {
        if (!name.endsWith('.log')) continue;
        var date = new Date(name.substring(0, name.lastIndexOf('.'))).getTime();
        if ((today - date) / DAY_IN_MS < this.#options.keep) continue;
        promises.push(unlink(join(this.#options.path, name)));
      }
      await Promise.all(promises);
    } catch (err) {
      this.emit('error', ROTATION_ERROR + err);
    }
  }
};
