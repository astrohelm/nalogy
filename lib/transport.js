'use strict';

const DEFAULT_TRANSPORTS = require('../modules');

const BROKEN_TRANSPORT = 'Write is not accessible at: ';
const INVALID_TRANSPORT = 'Transport is not accessible: ';
const NAMELESS_TRANSPORT = INVALID_TRANSPORT + 'Nameless';

function Transport({ target, lvl: minLVL, options }) {
  if (!target || typeof target !== 'string') throw new Error(NAMELESS_TRANSPORT);
  const Transport = DEFAULT_TRANSPORTS[target] ?? require(target);
  const transport = new Transport(options);
  if (typeof transport.write !== 'function') throw new Error(BROKEN_TRANSPORT + target);
  if (!minLVL) return transport;
  const write = transport.write;
  transport.write = (log, obj, logger) => {
    if (logger[minLVL] > logger[obj.lvl]) return;
    write.call(transport, log, obj, logger);
  };
  return transport;
}

module.exports = Transport;
