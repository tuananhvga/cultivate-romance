import type { HttpClient } from "../client";

export interface AssetNotify {
  itemId: string
  itemType: string
  itemCount: number
  /** Positive = gained, negative = spent */
  itemIncr: number
}

export interface BuyResponse {
  commodityId: string
  buyCount: string
  assetsNotify: AssetNotify[]
  rewardResult: unknown | null
  ams_serial: string
}

/** POST /pub/shop?a=buy */
export async function buy(client: HttpClient, commodityId: number, buyCount: number): Promise<BuyResponse> {
  return client.post<BuyResponse>("pub/shop", { commodityId, buyCount }, { params: { a: "buy" } });
}
