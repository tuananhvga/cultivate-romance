import type { HttpClient } from "../client";

export interface StoreItemBuyInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
}

export interface StoreItemGainInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
  /** Present for seed items */
  growDuration?: number
  /** Present for seed items */
  expValue?: number
  /** Present for building items */
  sSize?: string
}

export interface StoreItem {
  buyInfo: StoreItemBuyInfo[]
  gainInfo: StoreItemGainInfo
  sName: string
  commodityId: number
  iNameId: number
  iDescId: number
  iUnlockLevel: number
  iMaxBuyCount: number
  sGainInfo: string
  sTicInfo: string
  iIsOpen: number
  sIcon: string
  iUnlockSystemJumpId: number
  leftNum: number
  leftLimitNum: number
  /** Present for seed items */
  unlockedStatus?: number
  /** Present for building items */
  iShopPageId?: number
  /** Present for building items */
  iShopSubPageId?: number
  proDesc: string
  yellowDot: boolean
}

export interface GetStoreResponse {
  storeInfo: StoreItem[]
  ams_serial: string
}

/** POST /pub/shop?a=store */
export async function getStore(client: HttpClient, shopPageId: number): Promise<StoreItem[]> {
  const result = await client.post<GetStoreResponse>("pub/shop", { shopPageId }, { params: { a: "store" } });
  return result.storeInfo;
}
