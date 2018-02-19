import AppComposer from '../src/app-composer'
import * as assert from 'assert';


describe('AppComposer', () => {

  it('new', () => {
    const ac = new AppComposer('hello');
    assert.equal(ac.baseUrl, 'hello'); 
    assert.ok(ac.express);
  });

});
