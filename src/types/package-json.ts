import * as path from 'path';
import * as fs from 'fs';
import { Names } from './names';

export interface PackageJsonAppComposer {

}
export interface PackageJsonSchema {
  name: string;
  version: string;
  main: string;
  license: string;
  author: string;
  scripts: {
    dev: string;
  };
  dependencies?: { [id: string]: string };
  devDependencies?: { [id: string]: string };
  'app-composer'?: { [id: string]: PackageJsonAppComposer };
}

export class PackageJson {
  public static read(basePath: string): PackageJsonSchema {
    const packageJsonFname = path.join(basePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonFname).toString());
    return packageJson;
  }

  public static writeDummy(pkgName: string, directory: string, pkgs: Names[]): string {
    const packagesJson: PackageJsonSchema = {
      name: pkgName,
      version: '99.98.97',
      main: './lib/index.js',
      license: 'UNLICENSED',
      author: 'composer',
      scripts: {
        dev: ''
      },
      devDependencies: {
        'app-composer': '*'
      },
      dependencies: {}
    };
    pkgs.forEach((names) => {
      packagesJson.dependencies[names.packageJson.name] = `${names.packageJson.version}`;
    });
    const packageJsonFname = path.join(directory, 'package.json');
    fs.writeFileSync(packageJsonFname, JSON.stringify(packagesJson, null, 2));
    return packageJsonFname;
  }

  public static findPathTo(str: string): string {
    if (str.length === 0) { return null; }
    const stat = fs.statSync(str);
    if (!stat) {
      throw new Error(`this must be somewhere ${str}`);
    }
    let pjson: string;
    let base: string;
    if (stat.isDirectory()) {
      base = str;
      pjson = path.join(base, 'package.json');
    } else {
      base = path.dirname(str);
      pjson = path.join(base, 'package.json');
    }
    const ret = fs.existsSync(pjson);
    if (!ret) {
      if (base != path.dirname(base)) {
        return this.findPathTo(path.dirname(base));
      } else {
        return null;
      }
    }
    return base;
  }

  public static isComposable(schema: PackageJsonSchema): boolean {
    return 'app-composer' in schema == true;
  }

}
