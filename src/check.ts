import { farm, GardenInfo, harvest, HttpClient, plant, water } from "./client";
import { buy } from "./client/actions/buy";
import { getStore, StoreItem } from "./client/actions/getStore";
import { userSeed, userFlower, PackageItem } from "./client/actions/userPackage";
import desired from "../desired.json";
import { getAllMissions, missionSubmit } from "./client/actions/mission";

const DESIRED_SEED_COUNT = 6;

const desiredFlowerCount = desired;

async function ensureSeedCount(client: HttpClient, seeds: PackageItem[], store: StoreItem[]) {
  const seedStatuses = store.filter(s => s.unlockedStatus === 1).map(s => {
    const count = seeds.find(seed => seed.iItemId === s.commodityId)?.iAmount ?? 0;
    return { id: s.commodityId, count, name: s.sName };
  });
  for (const seed of seedStatuses) {
    if (seed.count < DESIRED_SEED_COUNT) {
      console.log(`You have ${seed.count} of ${seed.name}. Buying more ${DESIRED_SEED_COUNT - seed.count} from the store.`);
      await buy(client, seed.id, DESIRED_SEED_COUNT - seed.count);
    }
  }
}

function getPlantQueue(flowers: PackageItem[], store: StoreItem[], garden: GardenInfo[]): { id: number; name: string }[] {
  const flowerStatuses = store.filter(s => s.unlockedStatus === 1).map(s => {
    const flowerName = s.sName.slice(0, s.sName.length - 5);

    // count in package
    const countPackage = flowers.find(flower => flower.sItemName === flowerName)?.iAmount ?? 0;

    // count in garden
    const gardenCount = garden.filter(g => g.cropId === s.commodityId).length;

    const count = countPackage + gardenCount;
    const desiredCount = desiredFlowerCount[flowerName as keyof typeof desiredFlowerCount] ?? 0;

    const need = Math.max(desiredCount - count, 0);
    return { id: s.commodityId, need, name: flowerName };
  });
  const result: { id: number; name: string }[] = [];
  while (result.length < 6) {
    flowerStatuses.sort((a, b) => b.need - a.need);
    const mostNeeded = flowerStatuses[0];
    if (!mostNeeded) {
      console.warn("No more flowers available in the store.");
      break;
    }
    result.push({ id: mostNeeded.id, name: mostNeeded.name + " Seed" });
    mostNeeded.need = Math.max(mostNeeded.need - 1, 0);
  }
  return result;
}

async function submitMissions(client: HttpClient) {
  const { main } = await getAllMissions(client);
  const finishedMissions = main.filter(m => m.iStatus === 1);
  for (const mission of finishedMissions) {
    await missionSubmit(client, 1, mission.questId);
    console.log(`Submitted mission ${mission.questName}.`);
  }
}

export async function check(client: HttpClient) {
  let garden = await farm(client);
  const seeds = await userSeed(client);
  const flowers = await userFlower(client);
  const store = await getStore(client, 1);
  await ensureSeedCount(client, seeds, store);
  const needs = getPlantQueue(flowers, store, garden);

  // harvest first
  for (const g of garden) {
    if (g.cropId !== 0 && Date.now() > (g.plantTime + g.cropDetail.growTime) * 1000) {
      await harvest(client, g.landIndex);
      console.log(`Harvested ${g.cropDetail.sName} at land ${g.landIndex}.`);
    }
  }

  garden = await farm(client);
  // plant and water
  for (const g of garden) {
    if (g.cropId === 0) {
      // plant
      await plant(client, g.landIndex, needs[0].id);
      needs.shift();
      console.log(`Planted ${needs[0].name} at land ${g.landIndex}.`);
    } else if (Date.now() > (g.wateringTime + 1200) * 1000) {
      // water
      await water(client, g.landIndex);
      console.log(`Watered land ${g.landIndex}.`);
    }
  }
  await submitMissions(client);
  return { needs };
}
