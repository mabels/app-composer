import * as path from 'path';

import { GetPackageJsons } from './get-package-jsons';
import { PackageJsonFile } from '@app-composer/types';
import { readPackageJson } from './read-package-json';
import { getPackages } from './get-packages';

export async function collectAllPackageJson(
  config: GetPackageJsons.Type
): Promise<PackageJsonFile[]> {
  return await Promise.all(
    (await getPackages(config))
      .map(i => path.join(i, 'package.json'))
      .filter(pfile => pfile.startsWith('/'))
      .map(pfile => readPackageJson(pfile))
  );
}
