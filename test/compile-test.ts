import { AppComposer } from '../src/index';
import * as assert from 'assert';
import { PackageJsonSchema } from '../src/types/package-json';

describe('AppComposer', () => {

  it('new AppComposer', () => {
    const ac = new AppComposer('hello');
    assert.equal(ac.baseUrl, 'hello');
    assert.ok(ac.express);
  });

});



describe('AppComposer from PackageJson', () => {
  function packageJson(): PackageJsonSchema {
    return {
      name: 'test',
      version: 'version',
      'app-composer': {
        targets: {
          simple: {
            moduleName: 'simple-module',
            entryPoint: 'simple-entryPoint'
          },
          complex: [
            {
              moduleName: 'complex-module-1',
              entryPoint: 'complex-entryPoint-1'
            },
            {
              moduleName: 'complex-module-2',
              entryPoint: 'complex-entryPoint-2'
            }
          ]
        },
        plugins: [
          {
            moduleName: 'plugin-module-1',
            entryPoint: 'plugin-entryPoint-1'
          },
          {
            moduleName: 'plugin-module-2',
            entryPoint: 'plugin-entryPoint-2'
          }
        ]
      }
    };
  }
});
