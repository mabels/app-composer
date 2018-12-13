async function collectAllPackageJson(
  config: GetPackageJsons.Type
): Promise<PackageJsonFile[]> {
  const cmd = `cd ${config.projectRoot} && ${config.cmdGetPackageJsons}`;
  const ret = await execa.shell(cmd);
  return await Promise.all(
    ret.stdout
      .split(/[\n\r]+/)
      .filter(pfile => pfile.startsWith('/'))
      .map(pfile => readPackageJson(pfile))
  );
}
