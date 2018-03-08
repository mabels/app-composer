import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import { PackageJson } from '../types/package-json';
import { invokePackage } from './invoke-package';
import { transformToCompose } from './transform-to-compose';

export function startPkg(basePath: string = './'): void {
  const packageJson = PackageJson.read(basePath);
  if (!packageJson) {
    return;
  }
  const appComposer = packageJson['app-composer'];
  const perCompose = transformToCompose(packageJson, appComposer);

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
      const js = invokePackage(basePath, path.basename(pkgFname), entryPoints);
      fs.writeFileSync(`${pkgFname}.Invocation.json`, JSON.stringify(js.invocation, null, 2));
      entryPoints.map((ep) => {
        const composePkgJson = path.join(ep.compose, 'package.json');
        if (!fs.existsSync(composePkgJson)) {
          PackageJson.writeDummy(path.basename(ep.compose), ep.compose, []);
        }
      });
    });
  });
}
