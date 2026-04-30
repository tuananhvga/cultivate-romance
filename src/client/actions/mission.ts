import type { HttpClient } from "../client";

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

export interface AllMissions {
  main: MainMission[]
  chapter: Chapter
  order: Order
}

export interface AllMissionsResponse {
  missions: AllMissions
  ams_serial: string
}

export interface MissionSubmitResponse {
  missionType: number
  missionId: number
  ams_serial: string
}

/** POST /pub/init?a=getAllMissions */
export async function getAllMissions(client: HttpClient): Promise<AllMissions> {
  const result = await client.post<AllMissionsResponse>("pub/init", {}, { params: { a: "getAllMissions" } });
  return result.missions;
}

/** POST /pub/mission?a=missionSubmit */
export async function missionSubmit(client: HttpClient, missionType: number, missionId: number): Promise<MissionSubmitResponse> {
  return client.post<MissionSubmitResponse>("pub/mission", { missionType, missionId }, { params: { a: "missionSubmit" } });
}
