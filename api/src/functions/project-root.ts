import * as yargs from 'yargs';

export abstract class ProjectRoot {
  public readonly projectRoot: string;

  public static applyArgs(y: yargs.Argv): yargs.Argv {
    return y.option('projectRoot', {
      alias: 'R',
      require: true
    });
  }

  public static fromArgs(args: yargs.Arguments): ProjectRoot {
    return {
      projectRoot: args.projectRoot
    };
  }
}
