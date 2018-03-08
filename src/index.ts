import * as fs from 'fs';
import * as path from 'path';
import EntryPoint from './entry-point';
import Invocation from './invocation';
import { writePackageJson } from './watcher';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';

// tslint:disable-next-line: no-var-requires no-require-imports
// const globby = require('globby');

// tslint:disable-next-line: no-any
function transformToCompose(pjs: any, appComposer: any): Map<string, EntryPoint[]> {
  const perCompose = new Map<string, EntryPoint[]>();
  Object.keys(appComposer).forEach((epName) => {
    console.log(`entryPoint=${epName}`);
    const ep = appComposer[epName];
    const key = ep['compose'] || epName;
    let add = perCompose.get(key);
    if (!add) {
      add = [];
      perCompose.set(key, add);
    }
    ep['entry-point'] = ep['entry-point'] || key;
    ep['app-name'] = ep['app-name'] || key;
    add.push(new EntryPoint(pjs, ep));
  });
  return perCompose;
}

interface InvokePackage {
  name: string;
  invocation: Invocation;
  localJs: string;
  globalJs: string;
}

function invokePackage(basePath: string, packageName: string, entryPoints: EntryPoint[]): InvokePackage {
  console.log(`invoke ${packageName} for ${JSON.stringify(entryPoints.map((ep) => ep.appName))}`);
  const invocation = new Invocation(packageName);
  entryPoints.forEach((ep) => invocation.add(ep));
  const invokeJsFname = path.join(basePath, `.invoke.${packageName}.js`);
  const localJs = invocation.build(invocation.jsLocalRequires);
  const globalJs = invocation.build(invocation.jsGlobalRequires);
  return { name: invokeJsFname, invocation, localJs, globalJs };
}

export function readPackageJson(basePath: string): any  {
  const packageJsonFname = path.join(basePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonFname).toString());
  if (!packageJson['app-composer']) {
    console.log(`nothing todo app-composer section in ${packageJsonFname}`);
    return;
  }
  return packageJson;
}
export function app(basePath: string = './'): void {
  const packageJson = readPackageJson(basePath);
  if (!packageJson) {
    return;
  }
  const appComposer = packageJson['app-composer'];
  const perCompose = transformToCompose(packageJson, appComposer);
  perCompose.forEach((entryPoints, packageName) => {
    const ip = invokePackage(basePath, path.basename(packageName), entryPoints);
    fs.writeFileSync(ip.name, ip.localJs);
    // tslint:disable-next-line: no-eval
    // (() => { eval(js.js); })();
    require(ip.name);
  });
}

export function pkg(basePath: string = './'): void {
  const packageJson = readPackageJson(basePath);
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
          writePackageJson(path.basename(ep.compose), ep.compose, []);
        }
      });
    });
  });
}
