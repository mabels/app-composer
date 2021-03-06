import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as execa from 'execa';
import * as rimraf from 'rimraf';
import { Names } from '../types/names';

export function extractor(composePath: string, names: Names[]): Promise<Names[]> {
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
