
export interface Io {
  out(s: string): void;
  err(s: string): void;
  cmd(s: string): void;
}
