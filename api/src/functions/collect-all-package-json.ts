import * as path from 'path';

import * as execa from 'execa';

import { GetPackageJsons } from './get-package-jsons';
import { PackageJsonFile } from '@app-composer/types';
import { readPackageJson } from './read-package-json';
import { readFileString } from './promise-fs-util';

export async function collectAllPackageJson(
  config: GetPackageJsons.Type
): Promise<PackageJsonFile[]> {
  const pkgListFile = path.resolve(
    path.join(config.projectRoot, 'package.json.list')
  );
  const cmd = `cd ${config.projectRoot} && ${
    config.cmdGetPackageJsons
  } >> ${pkgListFile}`;
  await execa.shell(cmd);
  const pkgList = (await readFileString(pkgListFile)).content.split(/[\n\r]+/);
  return await Promise.all(
    pkgList
      .filter(pfile => pfile.startsWith('/'))
      .map(pfile => readPackageJson(pfile))
  );
}
