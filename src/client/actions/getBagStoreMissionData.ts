import type { HttpClient } from "../client";

// ── Category ────────────────────────────────────────────────────────────────

export interface SubCategory {
  iId: number
  iShopPageId: number
  sIcon: string
  iNameId: number
  sName: string
}

export interface Category {
  iId: number
  iHasSubPage: number
  iNameId: number
  sIcon: string
  subCateInfo: SubCategory[]
  sName: string
}

// ── Bag ─────────────────────────────────────────────────────────────────────

export interface Seed {
  iItemId: number
  sItemName: string
  sDesc: string
  iAmount: number
  iItemType: number
  sIcoPath: string
  iLevelRequire: number
  iGetWay: number
  unlock: number
}

export interface Flower {
  iItemId: number
  sDesc: string
  sItemName: string
  iItemType: number
  sIcoPath: string
  iAmount: number
  iLevelRequire: number
  iGetWay: number
  unlock: number
  sSize: string
  iBuildingTypeId: string
}

export interface Build {
  iItemId: number
  sItemName: string
  sDesc: string
  iItemType: number
  sIcoPath: string
  iAmount: number
  iLevelRequire: number
  iGetWay: number
  unlock: number
  sSize: string
  iBuildingTypeId: number
}

export interface Bag {
  seeds: Seed[]
  flowers: Flower[]
  builds: Build[]
}

// ── Shop ─────────────────────────────────────────────────────────────────────

export interface BuyInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
}

export interface SeedGainInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
  growDuration: number
  expValue: number
}

export interface BuildGainInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
  sSize: string
}

export interface GameItemGainInfo {
  itemType: string
  itemId: string
  itemNum: string
  itemName: string
}

export interface ShopSeed {
  buyInfo: BuyInfo[]
  gainInfo: SeedGainInfo
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
  unlockedStatus: number
  proDesc: string
  yellowDot: boolean
}

export interface ShopBuild {
  buyInfo: BuyInfo[]
  gainInfo: BuildGainInfo
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
  iShopPageId: number
  iShopSubPageId: number
  proDesc: string
}

export interface ShopGameItem {
  buyInfo: BuyInfo[]
  gainInfo: GameItemGainInfo
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
  proDesc: string
}

export interface Shop {
  seeds: ShopSeed[]
  builds: ShopBuild[]
  gameItems: ShopGameItem[]
}

// ── Mission ──────────────────────────────────────────────────────────────────

export interface MissionReward {
  rewardType: string
  rewardId: string
  rewardAmount: string
}

export interface MissionCommodity {
  type: number
  id: number
}

export interface MainMission {
  questId: number
  questName: string
  description: string
  sRewards: string
  sConditionList: string
  sConditionRelation: number
  iSystemJumpId: number
  iPublisher: number
  rewards: MissionReward[]
  totalProgress: number
  currentProgress: number
  iStatus: number
  commodity: MissionCommodity
}

export interface ChapterMission {
  questId: number
  questName: string
  description: string
  sRewards: string
  sConditionList: string
  sConditionRelation: number
  iSystemJumpId: number
  iPublisher: number
  rewards: MissionReward[]
  /** string when it represents a level target, number when a count */
  totalProgress: string | number
  currentProgress: string | number
  iStatus: number
  commodity: MissionCommodity
}

export interface Chapter {
  missionInfo: ChapterMission[]
  totalQuests: number
  completedQuests: number
  chapterName: string
  currentChapterId: number
}

export interface OrderSubTask {
  [key: string]: unknown
}

export interface OrderMission {
  taskId: number
  taskName: string
  isCompleted: boolean
  publisher: number
  publisherTitle: string
  publisherDesc: string
  finishedTaskNum: number
  yellowDot: boolean
  claimedRewards: Record<string, unknown>
  description: string
  rewards: string[][]
  starRating: number
  status: number
  subTasks: OrderSubTask[]
}

export interface Order {
  OrderMissionInfo: OrderMission[]
  DefaultMission: OrderMission
}

export interface Mission {
  main: MainMission[]
  chapter: Chapter
  order: Order
}

// ── DebugInfo ────────────────────────────────────────────────────────────────

export interface ItemNameInfo {
  iItemNameId: number
  iDescId: number
}

export interface MissionDot {
  missionDotConditionList: Record<string, unknown>
  conditionProgress: Record<string, unknown>
}

export interface DebugInfo {
  monthDateBoundary: number
  currentDay: string
  userBagItemCountMap: Record<string, number>
  itemMap: Record<string, ItemNameInfo>
  dots: Record<string, MissionDot>
}

// ── Top-level response ───────────────────────────────────────────────────────

export interface BagStoreMissionData {
  category: Category[]
  bag: Bag
  shop: Shop
  mission: Mission
  debugInfo: DebugInfo
  ams_serial: string
}

/** POST /pub/init?a=getBagStoreMissionData */
export async function getBagStoreMissionData(client: HttpClient): Promise<BagStoreMissionData> {
  return client.post<BagStoreMissionData>("pub/init", {}, { params: { a: "getBagStoreMissionData" } });
}
