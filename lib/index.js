'use strict';

const Transport = require('./transport');
const { EventEmitter } = require('./events');
const { asJson, Stringify, isNode, isBrowser } = require('./utils');
const { OPTIONS, LEVELS } = require('./config');
const { INVALID_OPTIONS } = require('./config');
const { create, assign } = Object;
const INVALID_CONFIG = 'Invalid transport configuration';

const kStringify = Symbol('nalogy:stringify');
module.exports = class Logger extends EventEmitter {
  levels = create(LEVELS);
  level = 'info';

  #bindings = null;
  #transports = [];
  constructor(options) {
    super();
    if (options === null || typeof options !== 'object') throw new Error(INVALID_OPTIONS);
    const config = this.#configure(assign(create(OPTIONS), options));
    if (typeof options === 'object' && options !== null) return this;
    const transports = !Array.isArray(options) ? [options] : options;
    const onError = err => this.emit('error', err);
    for (var transportOptions of transports) {
      if (typeof config !== 'object' || config === null) throw new Error(INVALID_CONFIG);
      var transport = new Transport(transportOptions);
      this.#transports.push(transport.on('error', onError));
    }

    // prettier-ignore
    isBrowser && window.addEventListener('beforeunload', () => {
      this.#transports.forEach(transport => transport.finish?.());
    });

    // prettier-ignore
    isNode && process.on('beforeExit', () => {
      this.#transports.forEach(transport => transport.finish?.());
    });
  }

  //? Configure options, that changes with children loggers
  #configure(options) {
    const { depthLimit, itemsLimit, customLevels, useOnlyCustomLevels, level } = options;
    this[kStringify] = Stringify.bind({ depthLimit, itemsLimit });
    this.level = level;

    if (typeof customLevels === 'object' && customLevels !== null) {
      this.levels = useOnlyCustomLevels ? customLevels : assign(this.levels, customLevels);
      // build lvl
    }
  }

  child(bindings, options) {
    const instance = Object.create(this);
    /* Rebind bindings
     * ...
     */
    return instance;
  }
};

// function Log(lvl, hook, ...args) {
//   const data = hook ? hook.call(this, args, lvl) : args;
//   const type = typeof data;
//   if (type === 'function' || type === 'symbol' || type === 'undefined') return;
//   if ((Array.isArray(data) && !data.length) || data === null) return;

//   const log = Object.create(this.state);
//   if (type === 'object') Object.assign(log, data);
//   else log.msg = data;
//   const json = asJson(log);
// }

// function Log(args) {
//   if (!args.length) return;
//   const log = Object.create(this.bindings);
//   log.lvl = lvl;
//   this.write(JSON.stringify(log), log);
// }
