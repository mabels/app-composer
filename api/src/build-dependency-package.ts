import * as fs from 'fs';
import * as path from 'path';

import * as execa from 'execa';
// import * as uuid from 'uuid';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import * as yargs from 'yargs';
import * as semver from 'semver';
import { buildDepCli } from './functions/build-dep-cli';

buildDepCli({
  async generate(config: GenerateConfig) {
    const pjsons = await collectAllPackageJson(config);
    const withOwnDependencies = mergeDependencies(
      config,
      pjsons,
      (await readPackageJson(path.join(config.projectRoot, 'package.json')))
        .data
    );
    const depends = filterOwnDependencies(config, pjsons, withOwnDependencies);
    await buildDependencyProject(config, depends);
  },
  async hoist(config: HoistConfig) {
    const pjsons = await collectAllPackageJson(config);
    hoistOwnPackage(config, pjsons);
  }
});
