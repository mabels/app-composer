import { AppComposer } from '../src';
import * as assert from 'assert';

describe('AppComposer', () => {
  test('new AppComposer', () => {
    const config = {
      port: 80
    };
    const ac = new AppComposer('hello', config);
    assert.equal(ac.baseUrl, 'hello');
    assert.ok(ac.express);
  });
});
