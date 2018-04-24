import { getPackageJsonFromArchive } from '../src/functions/archive-reader';
import * as assert from 'assert';
import * as execa from 'execa';
import * as path from 'path';
import * as uuid from 'uuid';

describe('getPackageJsonFromArchive', () => {
  it('read', async () => {
      return new Promise((rs, rj) => {
        getPackageJsonFromArchive(path.resolve('./test/data/example.npm.tgz')).then((pkgJson) => {
            assert.equal(pkgJson.name, 'test');
            rs('success');
          }).catch((e) =>  {
              try {
                assert.fail(e);
              } catch (e) {
                  rj(e);
              }
          });
      });

  });
});
