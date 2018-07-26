import { TargetEntryPoint } from '../types/target-entry-point';
// tslint:disable-next-line: no-any
export function transformToCompose(targets: TargetEntryPoint[]): Map<string, TargetEntryPoint[]> {
  const perCompose = new Map<string, Map<string, TargetEntryPoint>>();
  targets.forEach((target) => {
    // console.log(`entryPoint=${epName}`);
    // const ep = appComposer[epName];
    const key = target.composeName;
    let add = perCompose.get(key);
    if (!add) {
      add = new Map<string, TargetEntryPoint>();
      perCompose.set(key, add);
    }
    ep['entry-point'] = ep['entry-point'] || key;
    ep['app-name'] = ep['app-name'] || key;
    packageName: string, key: string, teps: TargetEntryPointSchema
    const tep = new TargetEntryPoint();
    add.set(tep.   new EntryPoint(pjs, ep));
  });
  const uniq = new Map<string, TargetEntryPoint[]>();
  perCompose.forEach((val, key) => {
    uniq.set(key, Array.from(val.values()));
  });
  return uniq;
}
