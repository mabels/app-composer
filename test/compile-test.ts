import { AppComposer } from '../src/index';
import * as assert from 'assert';

describe('AppComposer', () => {

  it('new AppComposer', () => {
    const ac = new AppComposer('hello');
    assert.equal(ac.baseUrl, 'hello');
    assert.ok(ac.express);
  });

});
