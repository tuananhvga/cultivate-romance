import type { HttpClient } from "../client";

export interface GardenInfo {
  landIndex: number
  cropId: number
  plantTime: number
  wateringTime: number
  cropDetail: CropDetail
}

export interface CropDetail {
  sSeedIcon: string
  sGrowthIcon: string
  sMatureIcon: string
  iRemoveItemId: number
  iRemoveAmount: number
  growTime: number
  sName: string
  iHarvestItemId: number
  iExpValue: number
}

export interface GardenResponse {
  gardenInfo: GardenInfo[]
  ams_serial: string
}


/** POST /pub/farm?a=garden */
// Response: {"ret":0,"msg":"success","iRet":0,"sMsg":"success","jData":{"gardenInfo":[{"landIndex":1,"cropId":2000005,"plantTime":1776955057,"wateringTime":1776956378,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}},{"landIndex":2,"cropId":2000005,"plantTime":1776955059,"wateringTime":1776956374,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}},{"landIndex":3,"cropId":2000005,"plantTime":1776955061,"wateringTime":1776956405,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}},{"landIndex":4,"cropId":2000005,"plantTime":1776955069,"wateringTime":1776956392,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}},{"landIndex":5,"cropId":2000005,"plantTime":1776955066,"wateringTime":1776956400,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}},{"landIndex":6,"cropId":2000005,"plantTime":1776955064,"wateringTime":1776956410,"cropDetail":{"sSeedIcon":"plant-crop-atlas,flower_seed.png","sGrowthIcon":"plant-crop-atlas,Iris_bud.png","sMatureIcon":"plant-crop-atlas,Iris_mature.png","iRemoveItemId":1000001,"iRemoveAmount":2,"growTime":6840,"sName":"Fire Iris Seed","iHarvestItemId":3000005,"iExpValue":4}}],"ams_serial":"AMS-AMGAS-0423154000-Umfj20-720075-68125"}}
export async function farm(client: HttpClient): Promise<GardenInfo[]> {
  const result = await client.post<GardenResponse>("pub/farm", {}, { params: { a: "garden" } });
  return result.gardenInfo;
}
