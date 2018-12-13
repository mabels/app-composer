import * as path from 'path';

import { buildDepCli } from './functions/build-dep-cli';
import {
  GenerateConfig,
  mergeDependencies,
  filterOwnDependencies,
  buildDependencyProject
} from './functions/generate';
import { hoistOwnPackage, HoistConfig } from './functions/hoist';
import { collectAllPackageJson } from './functions/collect-all-package-json';
import { readPackageJson } from './functions/read-package-json';

export function startBuildDepCli(): void {
  buildDepCli({
    async generate(config: GenerateConfig): Promise<void> {
      const pjsons = await collectAllPackageJson(config);
      const withOwnDependencies = mergeDependencies(
        config,
        pjsons,
        (await readPackageJson(path.join(config.projectRoot, 'package.json')))
          .data
      );
      const depends = filterOwnDependencies(
        config,
        pjsons,
        withOwnDependencies
      );
      await buildDependencyProject(config, depends);
    },
    async hoist(config: HoistConfig): Promise<void> {
      const pjsons = await collectAllPackageJson(config);
      hoistOwnPackage(config, pjsons);
    }
  });
}
