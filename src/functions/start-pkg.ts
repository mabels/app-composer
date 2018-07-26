import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import { PackageJson } from '../types/package-json';
import { invokePackage } from './invoke-package';
import { transformToCompose } from './transform-to-compose';
import { AppComposerImpl } from '../types/app-composer-schema';

export function startPkg(basePath: string = './'): void {
  const packageJson = PackageJson.read(basePath);
  if (!packageJson) {
    return;
  }
  if (!packageJson['app-composer']) {
    console.error(`package.json must contain app-composer from ${basePath}`);
    return;
  }
  const appComposer = AppComposerImpl.from(packageJson.name, packageJson['app-composer']);
  const perCompose = transformToCompose(appComposer.targets);

  perCompose.forEach((entryPoints, pname) => {
    const composeDir = `${pname}/compose`;
    const tmpDir = `${pname}/.tmp`;
    const pkgFname = path.join(composeDir, `${packageJson.name}`);
    const tmpPkgFname = path.join(tmpDir, `${packageJson.name}`);
    mkdirp.sync(path.dirname(pkgFname));
    mkdirp.sync(path.dirname(tmpPkgFname));
    console.log(`yarn pack -f ${tmpPkgFname}.npm.tgz`);
    const yarnExec = execa('yarn', ['pack', '-f', `${tmpPkgFname}.npm.tgz`]);
    yarnExec.stdout.pipe(process.stdout);
    yarnExec.stderr.pipe(process.stderr);
    yarnExec.then(() => {
      fs.renameSync(`${tmpPkgFname}.npm.tgz`, `${pkgFname}.npm.tgz`);
      const js = invokePackage(appComposer.plugins, basePath, path.basename(pkgFname), entryPoints);
      fs.writeFileSync(`${pkgFname}.Invocation.json`, JSON.stringify(js.invocation, null, 2));
      entryPoints.map((ep) => {
        if (!ep.composeDirectory) {
          return;
        }
        const composePkgJson = path.join(ep.composeDirectory, 'package.json');
        if (!fs.existsSync(composePkgJson)) {
          PackageJson.writeDummy(ep.packageName, ep.composeDirectory, []);
        }
      });
    });
  });
}
