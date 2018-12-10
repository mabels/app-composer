
export interface Invocation {
  readonly packageName: string;
  readonly jsEntryPoints: string[];
  readonly jsLocalRequires: string[];
  readonly jsGlobalRequires: string[];
}
