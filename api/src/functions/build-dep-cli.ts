import * as yargs from 'yargs';

import { HoistConfig } from './hoist';
import { GenerateConfig } from './generate';
import { GetPackageJsons } from './get-package-jsons';
import { ProjectRoot } from './project-root';
import { StdIo } from './std-io';
import { PublishConfig } from './publish';
import { PackageLock } from './package-lock';

interface Commands {
  generate(config: GenerateConfig): Promise<void>;
  hoist(config: HoistConfig): Promise<void>;
  publish(config: PublishConfig): Promise<void>;
}

export function buildDepCli(commands: Commands): void {
  const y0 = yargs.usage('$0 <cmd> [args]');
  y0.command(
    'generate',
    'generate dependency package',
    (y: yargs.Argv) => {
      y.option('outputDirectory', {
        alias: 'o',
        require: true
      });

      y.option('cmdInstallPackages', {
        alias: 'I',
        default: 'yarn install --pure-lockfile'
      });

      GetPackageJsons.applyArgs(y);
      ProjectRoot.applyArgs(y);
      PackageLock.applyArgs(y);

      y.option('yarnOfflineMirror', {
        alias: 'O',
        default: undefined
      });
      return y;
    },
    (args: yargs.Arguments) => {
      commands
        .generate({
          ...GetPackageJsons.fromArgs(args),
          ...PackageLock.fromArgs(args),
          io: StdIo.create(),
          cmdInstallPackages: args.cmdInstallPackages,
          outputDirectory: args.outputDirectory,
          yarnOfflineMirror: args.yarnOfflineMirror
        })
        .then()
        .catch();
    }
  );
  y0.command(
    'hoist',
    'hoist links into node_modules',
    (y: yargs.Argv) => {
      GetPackageJsons.applyArgs(y);
      ProjectRoot.applyArgs(y);
      return y;
    },
    (args: yargs.Arguments) => {
      commands
        .hoist({
          ...GetPackageJsons.fromArgs(args),
          io: StdIo.create()
        })
        .then()
        .catch();
    }
  );

  y0.command(
    'publish',
    'publish node_modules to gitrepo',
    (y: yargs.Argv) => {
      ProjectRoot.applyArgs(y);
      PackageLock.applyArgs(y);
      y.option('gitUrl', {
        alias: 'G',
        default: 'git@github.com:mabels/npm-prebuilder.git'
      });
      y.option('printVersion', {
        alias: 'V',
        type: 'boolean'
      });
      return y;
    },
    (args: yargs.Arguments) => {
      commands
        .publish({
          ...ProjectRoot.fromArgs(args),
          ...PackageLock.fromArgs(args),
          io: StdIo.create(),
          gitUrl: args.gitUrl,
          printVersion: args.printVersion
        })
        .then()
        .catch();
    }
  );
  y0.help().parse();
}
