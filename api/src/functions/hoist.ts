import * as fs from 'fs';
import * as path from 'path';

import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

import { Io, PackageJsonFile } from '@app-composer/types';
import { GetPackageJsons } from './get-package-jsons';
import { promiseCb } from './promise-fs-util';

export interface HoistConfig extends GetPackageJsons.Type {
  readonly io: Io;
  // readonly projectRoot: string;
}

export async function hoistOwnPackage(
  config: HoistConfig,
  pjsons: PackageJsonFile[]
): Promise<void[]> {
  const ourPackageNames = pjsons.map(pjson => pjson.data.name);
  const nodeModules = path.join(config.projectRoot, './node_modules');
  const directorysToCreate = Array.from(
    new Set(
      ourPackageNames
        .map(name => path.dirname(name))
        .filter(name => name.length)
    ).keys()
  );
  await Promise.all(
    directorysToCreate.map(dir => {
      return new Promise((rs, rj) => {
        mkdirp(path.join(nodeModules, dir), promiseCb(rs, rj));
      });
    })
  );
  return Promise.all(
    pjsons.map(
      pjson =>
        new Promise<void>(async (rs, rj) => {
          const dst = path.join(nodeModules, pjson.data.name);
          await new Promise((rs1, rj1) => {
            rimraf(dst, promiseCb(rs1, rj1));
          });
          await new Promise((rs1, rj1) => {
            const target = path.relative(
              path.join(nodeModules, path.dirname(pjson.data.name)),
              path.dirname(pjson.fname)
            );
            config.io.out(`hoist ${dst} -> ${target}`);
            fs.symlink(target, dst, promiseCb(rs1, rj1));
          });
          rs();
        })
    )
  );
}
