import * as assert from 'assert';
import * as fs from 'fs';
import * as uuid from 'uuid';
import { Invocation } from '../src/index';

function createInvokationObject(): any {
  return {
    packageName: 'test-package',
    jsEntryPoints: [
      'resolverTemplate(ep, appServer, appServerMerge)'
    ],
    jsLocalRequires: [
      'const ep = require("./from/here");'
    ],
    jsGlobalRequires: [
      'const ep = require("test-package/from/here");'
    ]
  };
}

describe('Invokation', () => {

  it('write invokation', () => {
    const params = createInvokationObject();
    const invocation = new Invocation('foo', params.jsEntryPoints, params.jsLocalRequires, params.jsGlobalRequires);
    const tmpFile = `/tmp/${uuid.v4()}`;
    fs.writeFileSync(tmpFile, invocation.build(invocation.jsGlobalRequires));
    const data = fs.readFileSync(tmpFile, 'utf-8');

    console.log(data);

    assert.equal(data.indexOf('const ep = require(') >= 0, true);
    assert.equal(data.indexOf('function resolverTemplate(') >= 0, true);
    assert.equal(data.indexOf('resolverTemplate(ep') >= 0, true);
  });

});
