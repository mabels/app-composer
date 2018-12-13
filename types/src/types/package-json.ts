import { TypedFileData } from './typed-file-data';

export interface PackageJsonAppComposer {
  'entry-point-file': string;
  compose: string;
}

export type VersionMap = { [id: string]: string };

export interface PackageJsonSchema {
  name: string;
  version: string;
  main: string;
  license: string;
  author: string;
  scripts: {
    [id: string]: string
  };
  dependencies?: VersionMap;
  devDependencies?: VersionMap;
  'app-composer'?: { [id: string]: PackageJsonAppComposer };
}

export type PackageJsonFile = TypedFileData<PackageJsonSchema>;
