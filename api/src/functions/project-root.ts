import * as path from 'path';

import * as yargs from 'yargs';

export abstract class ProjectRoot {
  public readonly projectRoot: string;

  public static applyArgs(y: yargs.Argv): yargs.Argv {
    return y.option('projectRoot', {
      alias: 'R',
      default: process.cwd()
    });
  }

  public static fromArgs(args: yargs.Arguments): ProjectRoot {
    return {
      projectRoot: path.resolve(args.projectRoot)
    };
  }
}
