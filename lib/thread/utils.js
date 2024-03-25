'use strict';

// 1 2 4 8 16 32 64 128 256 512 1000
const MAX_TIMEOUT = 1000;
function waitUntil(compare, done, timeout = Infinity) {
  const max = Date.now() + timeout;
  if (compare()) return void done(true);
  const check = timeout => {
    if (Date.now() > max) return void done(false);
    setTimeout(() => {
      if (compare()) return void done(true);
      check(timeout >= MAX_TIMEOUT ? MAX_TIMEOUT : timeout * 2);
    }, timeout);
  };
  check(1);
}

module.exports = {
  R_INDEX: 4,
  W_INDEX: 8,
  waitUntil,
};
