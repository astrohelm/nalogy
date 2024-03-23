'use strict';

const { OPTIONS, STREAM_OPTIONS, DAY_IN_MS, STAB_FUNCTION, PROMISE_TO_BOOL } = require('./config');
const { INVALID_OPTIONS, INVALID_DIRECTORY, CLOSING_ERROR, STREAM_ERROR } = require('./config');
const { createWriteStream, promises: fsp, unlinkSync, statSync } = require('node:fs');
const { cleanup, flushSync } = require('./utils');
const { EventEmitter } = require('node:events');
const { join } = require('node:path');
const { stat, mkdir, unlink } = fsp;

module.exports = class FSLogger extends EventEmitter {
  #buffer = { length: 0, store: [] };
  #options = Object.create(OPTIONS);
  #switchTimer = null;
  #flushTimer = null;
  #active = false;
  #stream = null;
  #lock = null;
  #location = '';
  #end = '\n';
  #file = '';

  /**
   * @name File system transport for nalogy logger
   * @warning **Only constructor may throw exceptions**
   */
  constructor(options = {}) {
    super();
    if (options === null || typeof options !== 'object') throw new Error(INVALID_OPTIONS);
    Object.assign(this.#options, options);
    if (this.#options.crlf) this.#end = 'crlf';
    this.#start().then(() => {
      if (!this.#options.silence) return;
      var emit = this.emit.bind(this);
      this.emit = (event, ...args) => {
        if (event === 'error') return this;
        return emit(event, ...args);
      };
    });
  }

  write(log) {
    this.#buffer.store.push(Buffer.from(log + this.#end));
    this.#buffer.length += log.length;
    this.#buffer.length > this.#options.bufferSize && this.#flush();
  }

  /* eslint-disable consistent-return */
  finish(isAsync) {
    if (!(this.#active && this.#stream)) return;
    if (this.#stream.destroyed || this.#stream.closed) return;
    this.#switchTimer = (clearTimeout(this.#switchTimer), null);
    this.#flushTimer = (clearTimeout(this.#flushTimer), null);
    this.#active = false;
    if (isAsync) return this.#close();
    //? In case if process burned out
    try {
      this.#stream.close();
      flushSync(this.#location, this.#buffer);
      const stats = statSync(this.#location);
      if (stats.size === 0) unlinkSync(this.#location);
    } catch (e) {
      process.stdout.write(CLOSING_ERROR + e);
    }
  }

  /**
   * @description Transport advanced initialization
   */
  async #start() {
    if (this.#active) return this;
    const path = this.#options.path;
    var isExist = await stat(path)
      .then(v => v.isDirectory())
      .catch(STAB_FUNCTION);

    if (!isExist) isExist = await mkdir(path).then(...PROMISE_TO_BOOL);
    if (!isExist) return this.emit('error', INVALID_DIRECTORY + path), this;
    await this.#open();
    return this;
  }

  /**
   * @description Opens file stream for writing, also schedules flush and switch processes.
   */
  async #open() {
    this.#file = new Date().toLocaleDateString(this.#options.locale) + '.log';
    this.#location = join(this.#options.path, this.#file);
    await cleanup(this, this.#options);

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
    this.#switchTimer = setTimeout(() => this.finish(true).then(() => this.#open()), tm);
  }

  /**
   * @name File switch - closing step
   * @description Will close the stream to current file & remove it if empty.
   */
  async #close() {
    await this.#flush();
    this.#stream.close();
    await stat(this.#location)
      .then(({ size }) => !size && unlink(this.#location).catch(STAB_FUNCTION))
      .catch(STAB_FUNCTION);
  }

  /**
   * @description Async winchester flush
   */
  async #flush() {
    if (this.#lock) await this.#lock;
    if (!this.#buffer.length || !this.#active) return Promise.resolve();
    const buffer = Buffer.concat(this.#buffer.store);
    this.#buffer.store.length = this.#buffer.length = 0;
    this.#lock = new Promise(res => void this.#stream.write(buffer, res));
    return this.#lock;
  }
};
