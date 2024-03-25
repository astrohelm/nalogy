'use strict';

const THREAD_ERROR = 'Process exited before destination stream was drained.';
const { workerData, parentPort } = require('worker_threads');
const { W_INDEX, R_INDEX, waitUntil } = require('./utils');
const state = new Int32Array(workerData.state);
const data = Buffer.from(workerData.data);
const filepath = workerData.path;
var destination = null;

//prettier-ignore
void async function main() {
  var worker = requireWorker();
  if (typeof worker === 'object') worker = worker.default;
  if (typeof worker === 'object') worker = worker.default;
  destination = await worker(workerData.workerData);

  destination.on('error', err => {
    store(W_INDEX, -2), store(R_INDEX, -2);
    parentPort.postMessage({ code: 'ERROR', err });
  });

  destination.on('close', () => {
    store(R_INDEX, Atomics.load(state, W_INDEX));
    setImmediate(() => void process.exit(0));
  });

  parentPort.postMessage({ code: 'READY' });
  process.nextTick(run);
}();

process.on('unhandledRejection', err => {
  parentPort.postMessage({ code: 'ERROR', err });
  process.exit(1);
});

process.on('uncaughtException', err => {
  parentPort.postMessage({ code: 'ERROR', err });
  process.exit(1);
});

process.once('exit', exitCode => {
  if (exitCode !== 0) return void process.exit(exitCode);
  if (!destination?.writableNeedDrain || destination?.writableEnded) return void process.exit(0);
  parentPort.postMessage({ code: 'WARN', err: new Error(THREAD_ERROR) });
});

//? === Utilities ===

const rCompare = val => Atomics.load(state, R_INDEX) !== val;
const wCompare = val => Atomics.load(state, W_INDEX) !== val;
function run() {
  const rEnd = Atomics.load(state, R_INDEX);
  const wEnd = Atomics.load(state, W_INDEX);
  if (rEnd === wEnd) return void waitUntil(wEnd === data.length ? rCompare : wCompare, run);
  if (wEnd === -1) return void destination.end();
  const result = destination.write(data.toString('utf8', rEnd, wEnd));
  if (result) return void (store(R_INDEX, wEnd), setImmediate(run));
  destination.once('drain', () => void (store(R_INDEX, wEnd), run()));
}

function store(index, value) {
  Atomics.store(state, index, value);
  Atomics.notify(state, index);
}

const realImport = new Function('modulePath', 'return import(modulePath)');
const BAD = ['ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING', undefined];
async function requireWorker() {
  try {
    if (!(filepath.endsWith('.ts') || filepath.endsWith('.cts'))) return await realImport(filepath);
    var pfx = process.platform === 'win32' ? 'file:///' : 'file://';
    if (!process[Symbol.for('ts-node.register.instance')]) realRequire('ts-node/register');
    else if (process.env.TS_NODE_DEV) realRequire('ts-node-dev');
    return realRequire(decodeURIComponent(filepath.replace(pfx, '')));
  } catch (error) {
    const isNotFound = ({ code }) => code === 'ENOTDIR' && filepath.startsWith('file://');
    if (isNotFound(error)) return realRequire(decodeURIComponent(filepath.replace('file://', '')));
    if (BAD.includes(error.code)) return realRequire(decodeURIComponent(filepath.replace(pfx, '')));
    throw error;
  }
}

/* eslint-disable no-undef, camelcase */
function realRequire(modulePath) {
  if (typeof __non_webpack__require__ !== 'function') return require(modulePath);
  return __non_webpack__require__(modulePath);
}
