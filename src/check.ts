import { farm, harvest, HttpClient, plant, water } from "./client";
import { buy } from "./client/actions/buy";
import { getStore, StoreItem } from "./client/actions/getStore";
import { userSeed, userFlower, PackageItem } from "./client/actions/userPackage";

const DESIRED_SEED_COUNT = 6;

const desiredFlowerCount = {
  "Skyglow Tulip": 30,
  "Battle Rose": 30,
  "Spirit Lotus": 30,
  "Emerald Vine": 30,
  "Fire Iris": 100,
  "Desert Rose": 30,
  "Voidbloom": 30,
  "Thunder Iris": 30,
  "Crystal Rose": 30,
  "Aurora Icebloom": 30,
  "Starlight Lily": 30,
  "Moonlight Lotus": 30,
}

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

function getPlantQueue(flowers: PackageItem[], store: StoreItem[]): { id: number; name: string }[] {
  const flowerStatuses = store.filter(s => s.unlockedStatus === 1).map(s => {
    const flowerName = s.sName.slice(0, s.sName.length - 5);
    const count = flowers.find(flower => flower.sItemName === flowerName)?.iAmount ?? 0;
    return { id: s.commodityId, count, name: s.sName.slice(0, s.sName.length - 5) };
  });
  const result: { id: number; name: string }[] = [];
  while (result.length < 6) {
    for (const flower of flowerStatuses) {
      const desiredCount = desiredFlowerCount[flower.name as keyof typeof desiredFlowerCount];
      if (flower.count < desiredCount && result.length < 6) {
        result.push({ id: flower.id, name: flower.name + " Seed" });
        flower.count++;
      }
    }
  }
  return result;
}

export async function check(client: HttpClient) {
  const garden = await farm(client);
  const seeds = await userSeed(client);
  const flowers = await userFlower(client);
  const store = await getStore(client, 1);
  await ensureSeedCount(client, seeds, store);
  const needs = getPlantQueue(flowers, store);
  for (const g of garden) {
    if (g.cropId === 0) {
      // plant
      await plant(client, g.landIndex, needs[0].id);
      needs.shift();
      console.log(`Planted ${needs[0].name} at land ${g.landIndex}.`);
    } else if (Date.now() > (g.plantTime + g.cropDetail.growTime) * 1000) {
      // harvest
      await harvest(client, g.landIndex);
      await plant(client, g.landIndex, needs[0].id);
      needs.shift();
      console.log(`Harvested and planted ${needs[0].name} at land ${g.landIndex}.`);
    } else if (Date.now() > (g.wateringTime + 1200) * 1000) {
      // water
      await water(client, g.landIndex);
      console.log(`Watered land ${g.landIndex}.`);
    }
  }
  return { needs };
}
