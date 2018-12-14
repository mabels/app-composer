import * as path from 'path';

import * as yargs from 'yargs';

export abstract class PackageLock {
  public readonly packageLock: string;

  public static applyArgs(y: yargs.Argv): yargs.Argv {
    return y.option('packageLock', {
      alias: 'L',
      default: 'yarn.lock'
    });
  }

  public static fromArgs(args: yargs.Arguments): PackageLock {
    return {
      packageLock: args.packageLock
    };
  }
}
