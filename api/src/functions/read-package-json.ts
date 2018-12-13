async function readPackageJson(fname: string): Promise<PackageJsonFile> {
  const fileString = await readFileString(fname);
  return {
    fname,
    data: JSON.parse(fileString.content) as PackageJson
  };
}
