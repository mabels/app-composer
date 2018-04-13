import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import { PackageJson } from '../types/package-json';
import { invokePackage } from './invoke-package';
import { transformToCompose } from './transform-to-compose';
import * as uuid from 'uuid';

type ObjMap = { [id: string]: string };
export interface CreatePkgOptions {
  replace: boolean;
  localDependencies: { [id: string]: string };
}

function addProjectPackages(pkgDeps: ObjMap, targetFolder: string, options: CreatePkgOptions): void {
  if (!options.localDependencies) {
    return;
  }

  Object.keys(options.localDependencies).forEach((dependencyName) => {
    if (pkgDeps[dependencyName]) {
      const pathToProject = options.localDependencies[dependencyName];
      const packageJson = PackageJson.read(pathToProject);
      if (pack(packageJson.name, pathToProject, targetFolder, options)) {
        addProjectPackages(packageJson.dependencies, targetFolder, options);
      }
    }
  });
}

function pack(packageName: string, sourceFolder: string, targetFolder: string, options: CreatePkgOptions): boolean {
  const composeDir = path.join(targetFolder, 'compose');
  const tmpDir = path.join(targetFolder, '.tmp', uuid.v4());
  const pkgFileName = path.join(composeDir, `${packageName}`);
  const tmpFileName = path.join(tmpDir, `${packageName}`);

  if (!options.replace && fs.existsSync(`${pkgFileName}.npm.tgz`)) {
    console.log(`${pkgFileName}.npm.tgz already exists. Skip packing...`);
    return false;
  }

  mkdirp.sync(path.dirname(pkgFileName));
  mkdirp.sync(path.dirname(tmpFileName));

  console.log(`yarn pack -f ${tmpFileName}.npm.tgz`);
  execa.sync('yarn', ['pack', '-f', `${tmpFileName}.npm.tgz`, '--no-progress', 'non-interactive'],
    { cwd: sourceFolder });

  fs.renameSync(`${tmpFileName}.npm.tgz`, `${pkgFileName}.npm.tgz`);
  return true;
}

export function createPkg(basePath: string = './', options?: CreatePkgOptions): void {
  const packageJson = PackageJson.read(basePath);
  if (!PackageJson.isComposable(packageJson)) {
    return;
  }

  options = options || { replace: false, localDependencies: {} };

  const appComposer = packageJson['app-composer'];
  const perCompose = transformToCompose(packageJson, appComposer);

  const composePaths: ObjMap = {};
  perCompose.forEach((entryPoints, composePath) => {
    composePath = path.resolve(basePath, composePath);
    const composeDir = path.join(composePath, 'compose');
    const pkgFname = path.join(composeDir, `${packageJson.name}`);

    pack(packageJson.name, basePath, composePath, options);
    addProjectPackages(packageJson.dependencies, composePath, options);

    composePaths[composePath] = composePath;

    const js = invokePackage(basePath, path.basename(pkgFname), entryPoints);
    PackageJson.writeDummy('app-composer', composePath, []);
    fs.writeFileSync(`${pkgFname}.Invocation.json`, JSON.stringify(js.invocation, null, 2));
  });
}
