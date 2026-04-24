import type { HttpClient } from "../client";

/** POST /pub/farm?a=plant */
export async function plant(
  client: HttpClient,
  landIndex: number,
  cropId: number
): Promise<unknown> {
  return client.post("pub/farm", { landIndex, cropId }, { params: { a: "plant" } });
}
