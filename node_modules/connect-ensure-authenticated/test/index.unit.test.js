const assert = require('assert');

const { ensureAuthenticated } = require('../lib');

describe('index unit test', () => {
  it('should export ensureAuthenticated function', () => {
    assert(typeof ensureAuthenticated === 'function');
  });
});
