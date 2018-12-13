import * as path from 'path';
import * as rimraf from 'rimraf';
import * as mkdirp from 'mkdirp';

import { Io, VersionMap } from '@app-composer/types';
import { GetPackageJsons } from './get-package-jsons';

export interface GenerateConfig extends GetPackageJsons.Type {
  readonly io: Io;
  readonly outputDirectory: string;
  readonly yarnOfflineMirror?: string;
  readonly cmdInstallPackages: string;
  readonly lockFile: string;
}

function toGeneratePackageJson(config: GenerateConfig): string {
  return path.join(config.outputDirectory, 'package.json');
}

async function buildDependencyProject(
  config: GenerateConfig,
  pjson: PackageJson
): Promise<void> {
  const outputDirectory = config.outputDirectory;
  await new Promise((rs, rj) => {
    rimraf(outputDirectory, promiseCb(rs, rj));
  });
  await new Promise((rs, rj) => {
    mkdirp(outputDirectory, promiseCb(rs, rj));
  });
  await copyFile(
    path.join(config.projectRoot, config.lockFile),
    path.join(config.outputDirectory, config.lockFile)
  );
  await new Promise((rs, rj) => {
    fs.writeFile(
      toGeneratePackageJson(config),
      JSON.stringify(pjson, null, 2),
      promiseCb(rs, rj)
    );
  });
  if (config.yarnOfflineMirror) {
    await new Promise((rs, rj) => {
      fs.writeFile(
        path.join(outputDirectory, '.yarnrc'),
        `yarn-offline-mirror "${config.yarnOfflineMirror}"\n`,
        promiseCb(rs, rj)
      );
    });
  }
  const p = execa.shell(
    `cd ${outputDirectory} && ${config.cmdInstallPackages}`
  );
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

async function collectAllPackageJson(
  config: GetPackageJsons.Type
): Promise<PackageJsonFile[]> {
  const cmd = `cd ${config.projectRoot} && ${config.cmdGetPackageJsons}`;
  const ret = await execa.shell(cmd);
  return await Promise.all(
    ret.stdout
      .split(/[\n\r]+/)
      .filter(pfile => pfile.startsWith('/'))
      .map(pfile => readPackageJson(pfile))
  );
}

function filterOwnDependencies(
  config: GenerateConfig,
  pjsons: PackageJsonFile[],
  p: PackageJson
): PackageJson {
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

function mergeDependencies(
  config: GenerateConfig,
  pjson: PackageJsonFile[],
  basePjson: PackageJson
): PackageJson {
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
