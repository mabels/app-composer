import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import { PackageJson } from '../types/package-json';
import { invokePackage } from './invoke-package';
import { transformToCompose } from './transform-to-compose';
import * as uuid from 'uuid';

type objMap = { [id: string]: string };

function addProjectPackages(pkgDeps: objMap, projectDeps: objMap, targetFolder: string): void {
  if (!projectDeps) {
    return;
  }

  Object.keys(projectDeps).forEach((dependencyName) => {
    if (pkgDeps[dependencyName]) {
      const pathToProject = projectDeps[dependencyName];
      console.log(`packing local dependency '${dependencyName}' from ${pathToProject}`);
      const packageJson = PackageJson.read(pathToProject);
      if (pack(packageJson.name, pathToProject, targetFolder)) {
        addProjectPackages(packageJson.dependencies, projectDeps, targetFolder);
      }
    }
  });
}

function pack(packageName: string, sourceFolder: string, targetFolder: string): boolean {
  const composeDir = path.join(targetFolder, 'compose');
  const tmpDir = path.join(targetFolder, '.tmp', uuid.v4());
  const pkgFileName = path.join(composeDir, `${packageName}`);
  const tmpFileName = path.join(tmpDir, `${packageName}`);

  if (fs.existsSync(`${pkgFileName}.npm.tgz`)) {
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

export function createPkg(basePath: string = './', projectDependencies?: { [id: string]: string }): void {
  const packageJson = PackageJson.read(basePath);
  if (!PackageJson.isComposable(packageJson)) {
    return;
  }

  const appComposer = packageJson['app-composer'];
  const perCompose = transformToCompose(packageJson, appComposer);

  const composePaths: objMap = {};
  perCompose.forEach((entryPoints, composePath) => {
    const composeDir = `${composePath}/compose`;
    const pkgFname = path.join(composeDir, `${packageJson.name}`);

    pack(packageJson.name, basePath, composePath);
    addProjectPackages(packageJson.dependencies, projectDependencies, composePath);

    composePaths[composePath] = composePath;

    const js = invokePackage(basePath, path.basename(pkgFname), entryPoints);
    PackageJson.writeDummy('app-composer', composePath, []);
    fs.writeFileSync(`${pkgFname}.Invocation.json`, JSON.stringify(js.invocation, null, 2));
  });
}
