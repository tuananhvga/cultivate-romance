import type { HttpClient } from "../client";

/** POST /pub/farm?a=water */
export async function water(client: HttpClient, landIndex: number): Promise<unknown> {
  return client.post("pub/farm", { landIndex }, { params: { a: "water" } });
}
