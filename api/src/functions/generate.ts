import * as path from 'path';
import * as fs from 'fs';

import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import * as semver from 'semver';

import {
  Io,
  VersionMap,
  PackageJsonSchema,
  PackageJsonFile
} from '@app-composer/types';
import { GetPackageJsons } from './get-package-jsons';
import { promiseCb, copyFile } from './promise-fs-util';
import { PackageLock } from './package-lock';

export interface GenerateConfig extends GetPackageJsons.Type, PackageLock {
  readonly io: Io;
  readonly outputDirectory: string;
  readonly yarnOfflineMirror?: string;
  readonly cmdInstallPackages: string;
}

function toGeneratePackageJson(config: GenerateConfig): string {
  return path.join(config.outputDirectory, 'package.json');
}

export async function buildDependencyProject(
  config: GenerateConfig,
  pjson: PackageJsonSchema
): Promise<void> {
  const outputDirectory = config.outputDirectory;
  console.log('A');
  await new Promise((rs, rj) => {
    rimraf(outputDirectory, promiseCb(rs, rj));
  });
  console.log('B');
  await new Promise((rs, rj) => {
    mkdirp(outputDirectory, promiseCb(rs, rj));
  });
  console.log('C', config.packageLock);
  await copyFile(
    path.join(config.projectRoot, config.packageLock),
    path.join(config.outputDirectory, config.packageLock)
  );
  console.log('D');
  await new Promise((rs, rj) => {
    fs.writeFile(
      toGeneratePackageJson(config),
      JSON.stringify(pjson, null, 2),
      promiseCb(rs, rj)
    );
  });
  console.log('E', config.packageLock);
  if (config.yarnOfflineMirror) {
    await new Promise((rs, rj) => {
      fs.writeFile(
        path.join(outputDirectory, '.yarnrc'),
        `yarn-offline-mirror "${config.yarnOfflineMirror}"\n`,
        promiseCb(rs, rj)
      );
    });
  }
  console.log('F', config.packageLock);
  const p = execa.shell(`${config.cmdInstallPackages}`, {
    cwd: outputDirectory
  });
  p.stdout.pipe(process.stdout);
  p.stderr.pipe(process.stderr);
  return new Promise<void>((rs, rj) => {
    p.on('close', () => {
      rs();
    });
    p.on('error', e => {
      rj(e);
    });
  });
}

export function filterOwnDependencies(
  config: GenerateConfig,
  pjsons: PackageJsonFile[],
  p: PackageJsonSchema
): PackageJsonSchema {
  const ourPackageNames = new Set<string>(pjsons.map(pjson => pjson.data.name));
  ourPackageNames.forEach(pname => {
    delete p.dependencies[pname];
    delete p.devDependencies[pname];
  });
  return p;
}

function sortByKeys(vm: VersionMap): VersionMap {
  const ret: VersionMap = {};
  Object.keys(vm)
    .sort()
    .forEach(k => (ret[k] = vm[k]));
  return ret;
}

export function mergeDependencies(
  config: GenerateConfig,
  pjson: PackageJsonFile[],
  basePjson: PackageJsonSchema
): PackageJsonSchema {
  const toSort = pjson.reduce(
    (prev, c) => {
      mergeVersion(c.fname, prev.dependencies, c.data.dependencies || {});
      mergeVersion(c.fname, prev.devDependencies, c.data.devDependencies || {});
      return prev;
    },
    {
      ...basePjson,
      dependencies: basePjson.dependencies || {},
      devDependencies: basePjson.devDependencies || {}
    }
  );
  toSort.dependencies = sortByKeys(toSort.dependencies);
  toSort.devDependencies = sortByKeys(toSort.devDependencies);
  return toSort;
}

function mergeVersion(
  fname: string,
  target: VersionMap,
  src: VersionMap
): VersionMap {
  Object.keys(src).forEach(pkg => {
    if (!target[pkg]) {
      target[pkg] = src[pkg];
    } else {
      // tslint:disable-next-line:no-console
      // console.log(fname, pkg, `${target[pkg]}:${src[pkg]}`);
      if (
        semver.lt(
          semver.coerce(target[pkg]) || '0.0.0',
          semver.coerce(src[pkg]) || '0.0.0'
        )
      ) {
        target[pkg] = src[pkg];
      }
    }
  });
  return target;
}
