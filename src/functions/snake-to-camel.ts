
export function snakeToCamel(s: string): string {
  return s.replace(/(\-\w)/g, (m) => m[1].toUpperCase());
}
