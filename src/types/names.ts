import { PackageJsonSchema } from './package-json';

export interface Names {
  package: string;
  invocationJson: string;
  npmPackage: string;
  packageJson?: PackageJsonSchema;
  uuid?: string;
}
