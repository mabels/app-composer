import * as path from 'path';
import * as fs from 'fs';
import * as execa from 'execa';
// import * as invoke from './index';
import * as uuid from 'uuid';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as chokidar from 'chokidar';
import { Watcher, Names } from './watcher';
// import { watch } from 'fs';

// tslint:disable-next-line: no-var-requires no-require-imports
const globby = require('globby');
// tslint:disable-next-line: no-var-requires no-require-imports


function extractor(composePath: string, names: Names[]): Promise<Names[]> {
  const extractedPath = path.join(composePath, '..', 'node_modules');
  const promiseNames = names.map((u) => new Promise<Names>((rs, rj) => {
    const tmpDir = path.join(extractedPath, '.temp', u.uuid);
    // console.log(`mkdirp: ${tmpDir}`);
    mkdirp(tmpDir, (err) => {
      if (err) {
        rj(err);
        return;
      }
      execa('sh', ['-c', `cd ${tmpDir} && tar xzf ${u.npmPackage}`]).then(() => {
        const packageDir = path.join(tmpDir, 'package');
        u.packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json')).toString());
        const pname = u.packageJson.name;
        const pkgDir = path.join(extractedPath, pname);
        // console.log(`remove to ${pkgDir}`);
        rimraf(pkgDir, (_err) => {
          if (_err) {
            rj(_err);
            return;
          }
          // console.log(`mkdir to ${path.dirname(pkgDir)}`);
          mkdirp(path.dirname(pkgDir), (_err2) => {
            if (_err2) {
              rj(_err2);
              return;
            }
            // console.log(`renamed:${packageDir}->${pkgDir}`);
            fs.rename(packageDir, pkgDir, () => {
              rimraf(tmpDir, (_err3) => {
                if (_err3) {
                  rj(_err3);
                  return;
                }
                rs(u);
              });
            });
          });
        });
      }).catch(rj);
    });
  }));
  return Promise.all<Names>(promiseNames);
  // const tarFname = pkgs[0];
  // execa('tar', ['xzf', tarFname, 
  // const urls = pkgs
  //   .map((fname) => fname.substr(baseDir.length + '/'.length))
  //   .map((fname) => `file:./${fname}`);
  // console.log(`npx yarn add "${urls.join('" "')}"`);
  // const rexec = execa('npx', ['yarn', 'add'].concat(urls));
  // rexec.stdout.pipe(process.stdout);
  // rexec.stderr.pipe(process.stderr);
  // rexec.then(() => rs(pkgs)).catch(rj);
  // // Promise.all(pkgs.map((tarFname) => tar.x({
  // //     file: tarFname
  // //   })
  // // })).then(); 
}

class Suffixes {
  public readonly values: string[];
  public readonly names: Names;
  public constructor(names: Names) {
    this.names = names;
    this.values = [names.invocationJson, names.npmPackage];
  }
}

export function filesToNames(files: string[]): Map<string, Names> {
  const pkgs = new Map<string, string[]>();
  const suffixs = new Suffixes({
    package: 'suffixes',
    invocationJson: '.Invocation.json',
    npmPackage: '.npm.tgz'
  });
  files.forEach((fname) => {
    suffixs.values.forEach((suffix) => {
      if (!fname.endsWith(suffix)) {
        return;
      }
      const base = fname.slice(0, -suffix.length);
      const append = (pkgs.get(base) || []);
      append.push(fname);
      pkgs.set(base, append);
    });
  });
  Array.from(pkgs.entries()).forEach((e) => {
    if (e[1].length !== suffixs.values.length) {
      pkgs.delete(e[0]);
    }
  });
  const ret = new Map<string, Names>();
  pkgs.forEach((v, k) => {
    ret.set(k, {
      package: k,
      invocationJson: v.find((i) => i.endsWith(suffixs.names.invocationJson)),
      npmPackage: v.find((i) => i.endsWith(suffixs.names.npmPackage)),
      uuid: uuid.v4(),
    });
  });
  // console.log(`filesToNames:${JSON.stringify(Array.from(ret.values()))}`);
  return ret;
}

export function extractFromCompose(basePath: string, composePath: string, prevPkgs: string[]): Promise<Names[]> {
  return new Promise((rs, rj) => {
    const globCompose = `${composePath}/**/*`;
    // console.log(`yarnAddOrExtract:${globCompose}`);
    globby([globCompose]).then((files: string[]) => {
      // console.log(`yarnAddOrExtract:${globCompose}:${files}`);
      const names = filesToNames(files.sort());
      extractor(composePath, Array.from(names.values())).then((nss) => {
        rs(nss);
      });
    });
  });
}


export function start(baseDir: string = __dirname) {
  const watchDir = path.join(baseDir, 'compose');
  const watcher = new Watcher(path.basename(baseDir), baseDir, watchDir); 
  console.log(`composer starts in ${baseDir} watches: ${watchDir}`);
  const choki = chokidar.watch(watchDir, {
    ignoreInitial: true
  });
  choki.on('all', () => watcher.dog('watch'));
  choki.on('ready', () => watcher.dog('ready'));
}


