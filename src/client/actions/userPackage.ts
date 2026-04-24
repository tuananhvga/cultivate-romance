import type { HttpClient } from "../client";

export interface PackageItem {
  iItemId: number
  sItemName: string
  iAmount: number
  iItemType: number
  sIcoPath: string
  iLevelRequire: number
  iGetWay: number
  unlock: number
}

export interface UserPackageResponse {
  packageInfo: PackageItem[]
  ams_serial: string
}

/** POST /pub/user?a=package */
async function userPackage(client: HttpClient, itemType: number): Promise<PackageItem[]> {
  const result = await client.post<UserPackageResponse>("pub/user", { itemType }, { params: { a: "package" } });
  return result.packageInfo;
}

export async function userSeed(client: HttpClient): Promise<PackageItem[]> {
  return userPackage(client, 1);
}

export async function userFlower(client: HttpClient): Promise<PackageItem[]> {
  return userPackage(client, 2);
}
