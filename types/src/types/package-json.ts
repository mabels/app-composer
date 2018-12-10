
export interface PackageJsonAppComposer {
  'entry-point-file': string;
  compose: string;
}

export interface PackageJsonSchema {
  name: string;
  version: string;
  main: string;
  license: string;
  author: string;
  scripts: {
    [id: string]: string
  };
  dependencies?: { [id: string]: string };
  devDependencies?: { [id: string]: string };
  'app-composer'?: { [id: string]: PackageJsonAppComposer };
}
